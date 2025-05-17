import { DataTypes } from 'sequelize';

export default function(sequelize) {
  const RefreshToken = sequelize.define('RefreshToken', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: false
    },
    created_by_ip: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    revoked: {
      type: DataTypes.DATE,
      allowNull: true
    },
    revoked_by_ip: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    replaced_by_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_expired: {
      type: DataTypes.VIRTUAL,
      get() {
        return Date.now() >= this.expires.getTime();
      }
    },
    is_active: {
      type: DataTypes.VIRTUAL,
      get() {
        return !this.revoked && !this.is_expired;
      }
    }
  }, {
    tableName: 'refresh_tokens',
    timestamps: true,
    paranoid: false,
    defaultScope: {
      attributes: { exclude: ['token'] }
    }
  });

  // Asociaciones
  RefreshToken.associate = function(models) {
    RefreshToken.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return RefreshToken;
};
