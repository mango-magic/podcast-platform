const { Sequelize } = require('sequelize');

// Initialize Sequelize
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  console.error('Please set DATABASE_URL in your Render environment variables.');
  console.error('You can get it from: https://dashboard.render.com/d/dpg-d49liv8gjchc73fflmr0-a');
  process.exit(1);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

// User Model
const User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  linkedinId: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  profilePictureUrl: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  accessToken: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  refreshToken: {
    type: Sequelize.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'users'
});

// Podcast Model
const Podcast = sequelize.define('Podcast', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  rssFeedUrl: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  coverImageUrl: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  website: {
    type: Sequelize.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'podcasts'
});

// Guest Model
const Guest = sequelize.define('Guest', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  linkedinId: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: true
  },
  company: {
    type: Sequelize.STRING,
    allowNull: true
  },
  profilePictureUrl: {
    type: Sequelize.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'guests'
});

// Episode Model
const Episode = sequelize.define('Episode', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  audioUrl: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  videoUrl: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  transcript: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  duration: {
    type: Sequelize.INTEGER,
    allowNull: true,
    comment: 'Duration in seconds'
  },
  status: {
    type: Sequelize.ENUM('draft', 'processing', 'published', 'archived'),
    defaultValue: 'draft'
  },
  publishedAt: {
    type: Sequelize.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'episodes'
});

// Clip Model
const Clip = sequelize.define('Clip', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  startTime: {
    type: Sequelize.INTEGER,
    allowNull: false,
    comment: 'Start time in seconds'
  },
  duration: {
    type: Sequelize.INTEGER,
    allowNull: false,
    comment: 'Duration in seconds'
  },
  videoUrl: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  audioUrl: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  platform: {
    type: Sequelize.ENUM('tiktok', 'instagram', 'linkedin', 'youtube', 'twitter', 'general'),
    defaultValue: 'general'
  },
  status: {
    type: Sequelize.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft'
  }
}, {
  timestamps: true,
  tableName: 'clips'
});

// Distribution Model
const Distribution = sequelize.define('Distribution', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  platform: {
    type: Sequelize.ENUM('linkedin', 'twitter', 'youtube', 'instagram', 'tiktok', 'rss'),
    allowNull: false
  },
  platformPostId: {
    type: Sequelize.STRING,
    allowNull: true
  },
  status: {
    type: Sequelize.ENUM('pending', 'published', 'failed'),
    defaultValue: 'pending'
  },
  publishedAt: {
    type: Sequelize.DATE,
    allowNull: true
  },
  errorMessage: {
    type: Sequelize.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'distributions'
});

// Processing Job Model
const ProcessingJob = sequelize.define('ProcessingJob', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  jobType: {
    type: Sequelize.ENUM('transcription', 'editing', 'clip_generation', 'distribution'),
    allowNull: false
  },
  status: {
    type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  resultData: {
    type: Sequelize.JSONB,
    allowNull: true
  },
  errorMessage: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  completedAt: {
    type: Sequelize.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'processing_jobs'
});

// Define Relationships
User.hasMany(Podcast, { foreignKey: 'userId', as: 'podcasts' });
Podcast.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Podcast.hasMany(Episode, { foreignKey: 'podcastId', as: 'episodes' });
Episode.belongsTo(Podcast, { foreignKey: 'podcastId', as: 'podcast' });

Episode.belongsToMany(Guest, { 
  through: 'EpisodeGuests', 
  foreignKey: 'episodeId',
  as: 'guests'
});
Guest.belongsToMany(Episode, { 
  through: 'EpisodeGuests', 
  foreignKey: 'guestId',
  as: 'episodes'
});

Episode.hasMany(Clip, { foreignKey: 'episodeId', as: 'clips' });
Clip.belongsTo(Episode, { foreignKey: 'episodeId', as: 'episode' });

Episode.hasMany(Distribution, { foreignKey: 'episodeId', as: 'distributions' });
Distribution.belongsTo(Episode, { foreignKey: 'episodeId', as: 'episode' });

Episode.hasMany(ProcessingJob, { foreignKey: 'episodeId', as: 'processingJobs' });
ProcessingJob.belongsTo(Episode, { foreignKey: 'episodeId', as: 'episode' });

// Export models
module.exports = {
  sequelize,
  User,
  Podcast,
  Guest,
  Episode,
  Clip,
  Distribution,
  ProcessingJob
};

