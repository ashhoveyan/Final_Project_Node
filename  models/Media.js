import sequelize from '../clients/sequelize.mysql.js';
import { DataTypes, Model } from 'sequelize';
import Users from "./Users.js";

class Media extends Model {
}

Media.init(
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        path: {
            type: DataTypes.STRING,
        },
    },
    {

        sequelize,
        timestamps: true,
        modelName: 'media',
        tableName: 'media',
    }
)

Users.hasMany(Media, {
    foreignKey: 'userId',
    as: 'avatar',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Media.belongsTo(Users, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});


export default Media;