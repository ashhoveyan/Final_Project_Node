import fs from 'fs';
import path from 'path';

export default (schema, target) => {
    return (req, res, next) => {
        const {error} = schema.validate(req[target], {abortEarly: false});
        const fields = {};
        if (error) {

            if (res.file && req.file.path) {
                try {
                    fs.unlinkSync(path.resolve(req.file.path));
                } catch (unlinkErr) {
                    console.error('Failed to delete file:', unlinkErr);
                }
            }
            if (res?.files?.length) {
                for (const file of res?.files) {
                    if (file && file.path) {
                        try {
                            fs.unlinkSync(path.resolve(file.path));
                        } catch (unlinkErr) {
                            console.error('Failed to delete file:', unlinkErr);
                        }
                    }
                }
            }

            error.details.forEach(detail => {
                fields[detail.path[0]] = detail.message;
            });
            const hasErrors = Object.keys(fields).length > 0;

            if (hasErrors) {
                res.status(422).json({"errors": fields, "message": "Validation Failed!"});

                return fields
            }
        }
        next()
    }
}