import {v4 as uuid} from 'uuid';
import fs from "fs";

import Users from '../ models/Users.js';
import Media from '../ models/Media.js';

import jwt from "jsonwebtoken";

import {sendMail} from "../services/Mail.js";
import {createXlsx} from "../services/Xlsx.js";
import path from "path";

const {SECRET_FOR_RECOVERY} = process.env;

export default {
    registration: async (req, res) => {
        const avatarPath = req.file ? req.file.path.replace('public/', '') : null;
        try {
            //console.log(req.files)
            const {username, email, password} = req.body;

            const [user, created] = await Users.findOrCreate({
                where: {email},
                defaults: {
                    username,
                    email: email.toLowerCase(),
                    password
                }
            });
            if (!created) {
                if (req.file) {
                    try {
                        await fs.unlinkSync(req.file.path);
                    } catch (unlinkErr) {
                        console.error('File removal failed:', unlinkErr);
                    }
                }
                return res.status(409).json({
                    message: 'User already exists',
                });
            }

            if (avatarPath) {
                await Media.create({
                    userId: user.id,
                    path: avatarPath
                })
            }

            const result = await Users.findByPk(user.id, {
                include: [
                    {
                        model: Media,
                        as: 'avatar',
                        attributes: ['path'],
                    },
                ],
            });

            const activationKey = uuid()

            await Users.update({
                activationKey,
            }, {
                where: {id: user.id}

            })

            await sendMail({
                to: result.email,
                subject: 'Welcome to my project',
                template: 'userActivation',
                templateData: {
                    link: `http://localhost:3000/users/activate?key=${activationKey}`
                }

            })
            return res.status(201).json({
                message: 'User created successfully',
                user: result,
            });

        } catch (error) {
            console.error('Registration Error:', error);
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (unlinkErr) {
                    console.error('File removal failed:', unlinkErr);
                }
            }
            return res.status(500).json({
                message: 'registration failed',
                error: error.message,
            });
        }
    },

    activate: async (req, res) => {
        try {
            const {key} = req.query;
            const user = await Users.findOne({
                where: {activationKey: key}
            });

            if (!user) {
                res.status(404).json({
                    message: 'User does not exist',
                })
                return;
            }
            if (user.status === 'active') {
                res.status(200).json({
                    message: 'User already activated',
                })
                return;
            }
            await Users.update({
                status: 'active',
            }, {
                where: {
                    id: user.id
                }

            })

            return res.status(200).json({
                message: 'User activated successfully',
            })
        } catch (e) {
            console.error('Activation error:', e);
            res.status(500).json({
                message: 'Internal server error',
                error: e.message,
            })
        }
    },

    login: async (req, res) => {
        try {
            const {email, password} = req.body;

            const user = await Users.findOne({
                where: {email},

            });
            const hashedPassword = Users.hash(password)

            if (hashedPassword !== user.getDataValue("password")) {
                return res.status(400).json({
                    message: 'Invalid Email or password'
                });
            }

            if (user.status !== 'active'){
                return res.status(401).json({
                    message: 'pls confirm your email address',
                })
            }

            const payload = {
                id: user.id,
                email: user.email,
            };

            const token = jwt.sign(
                payload,
                process.env.SECRET_FOR_JWT, {
                    expiresIn: '24h',
                });

            console.log(token)
            console.log(user)

            if (user.type === "admin") {
                return res.status(200).json({
                    message: 'Admin logged in successfully',
                    user: user,
                    token: token,
                    isAdmin: true
                });
            }

            return res.status(200).json({
                message: 'User logged in successfully',
                user: user,
                token: token,
                isAdmin: false
            });

        } catch (error) {
            console.error('Login Error:', error);
            return res.status(500).json({
                message: 'Login failed',
                error: error.message
            });
        }
    },

    userProfile: async (req, res) => {
        try {
            const {id} = req.user;

            const user = await Users.findByPk(id, {
                include: [
                    {
                        model: Media,
                        as: 'avatar',
                        attributes: ['path']
                    },
                ],
            });

            res.status(200).json({
                message: 'User profile retrieved successfully',
                user
            })
        } catch (e) {
            res.status(500).json({
                message: 'Internal server error',
                error: e.message,
            })
        }
    },

    recoveryPassword: async (req, res) => {
        try {
            const {email} = req.body;
            const user = await Users.findOne({where: {email}});

            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email
                },
                SECRET_FOR_RECOVERY,
                {expiresIn: '30d'}
            );

            await sendMail({
                to: user.email,
                subject: 'Password Recovery',
                template: 'userForgotedPass',
                templateData: {
                    link: `http://localhost:3000/users/update/password?key=${token}`,
                },
            });

            return res.status(200).json({
                message: 'Password recovery email sent successfully',
            });
        } catch (error) {
            console.error('Error in password recovery:', error);
            return res.status(500).json({
                message: 'Internal server error',
                error: error.message,
            });
        }
    },

    updatePassword: async (req, res) => {
        try {
            const {newPassword, repeatPassword} = req.body;
            const {key} = req.query;

            if (!key) {
                res.status(400).json({
                    message: 'Password reset token must be provided'
                });
                return
            }
            const verifyPassword = jwt.verify(key, SECRET_FOR_RECOVERY);

            if (newPassword !== repeatPassword) {
                res.status(400).json({
                    message: 'Passwords do not match'
                });
                return
            }

            await Users.update(
                {password: newPassword},
                {
                    where: {
                        id: verifyPassword.id
                    }
                }
            );
            return res.status(200).json({message: 'Password updated successfully'});

        } catch (error) {
            console.error('Error updating password:', error);
            return res.status(500).json({
                message: 'Internal server error',
                error: error.message,
            });
        }
    },

    usersList: async (req, res) => {
        try {
            const usersList = await Users.findAll({raw: true});

            const filename =  `user-${Date.now()}.xlsx`;
            const fullPath =   `./public/xlsx/${filename}`;

            createXlsx(usersList, fullPath);

            await sendMail({
                to: 'ash.hoveyan.02@mail.ru',
                subject:'Users statistic xlsx file',
                template:'statistic',
                templateData: {},
                attachments:[
                    {
                        filename,
                        path:path.resolve(fullPath)
                    }
                ]
            })

            await fs.unlink(path.resolve(fullPath));
            return res.status(200).json({
                message:'Successfully'
            })
        }catch (e){
            console.log(e)
        }
    },


}