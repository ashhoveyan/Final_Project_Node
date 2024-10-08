import {DataTypes,Model} from 'sequelize';
import sequelize from "../clients/sequelize.mysql.js";
import md5 from "md5";

const {SECRET_FOR_PASSWORD} = process.env

class Users extends Model {
    static hash(password) {
        return  md5(md5(password) + SECRET_FOR_PASSWORD);
    }
}


Users.init(
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            get() {
                return undefined
            },
            set(value) {
                this.setDataValue("password", Users.hash(value));
            }

        },
        type: {
            type: DataTypes.ENUM('user', 'admin'),
            allowNull: false,
            defaultValue: 'user',
        },
        activationKey:{
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'pending',
        },
    },
    {
        sequelize,
        timestamps: true,
        modelName: 'users',
        tableName: 'users',
        indexes: [
            {
                unique: true,
                fields: ['email'],
            },
        ]
    });


export default Users;