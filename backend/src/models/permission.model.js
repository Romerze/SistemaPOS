import { DataTypes } from 'sequelize';

export default function(sequelize) {
  const Permission = sequelize.define('Permission', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'El nombre del permiso es obligatorio'
        },
        len: {
          args: [2, 100],
          msg: 'El nombre del permiso debe tener entre 2 y 100 caracteres'
        }
      }
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    resource: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El recurso es obligatorio'
        }
      }
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La acción es obligatoria'
        },
        isIn: {
          args: [['create', 'read', 'update', 'delete', 'manage']],
          msg: 'La acción no es válida'
        }
      }
    },
    is_system: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {
    tableName: 'permissions',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['resource', 'action']
      }
    ]
  });

  // Asociaciones
  Permission.associate = function(models) {
    Permission.belongsToMany(models.Role, {
      through: 'role_permissions',
      foreignKey: 'permission_id',
      otherKey: 'role_id',
      as: 'roles'
    });
  };

  return Permission;
};
