import { DataTypes } from 'sequelize';

export default function(sequelize) {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'El nombre del rol es obligatorio'
        },
        len: {
          args: [2, 50],
          msg: 'El nombre del rol debe tener entre 2 y 50 caracteres'
        }
      }
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {
    tableName: 'roles',
    timestamps: true,
    paranoid: true
  });

  // Asociaciones
  Role.associate = function(models) {
    Role.belongsToMany(models.User, {
      through: 'user_roles',
      foreignKey: 'role_id',
      otherKey: 'user_id',
      as: 'users'
    });

    Role.belongsToMany(models.Permission, {
      through: 'role_permissions',
      foreignKey: 'role_id',
      otherKey: 'permission_id',
      as: 'permissions'
    });
  };

  return Role;
};
