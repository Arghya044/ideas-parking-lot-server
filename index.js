const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { body, validationResult } = require('express-validator');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Firebase Admin SDK Configuration
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID || "ideas-parking-lot-28e59",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "ab8474436642cabd0f04a1bcac8bb63ec09e565d",
  private_key: (process.env.FIREBASE_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCZI68uOJ2OZLni\nFKfz03G515CyB2aDWvJsGNL17pG51LLHqWbv2sunxHygXzcAAZEhQ51fpyZjvM69\nt0lko1Bn40QTlSpB7pU5lOEpmTT+2YbCci1nUsU6Jz6fyiZZC4ROLvZLGQbbtaE7\nobHlH1SdYuMbNeWf9LvK7hMvKvEwajqvFPjXyXmdGhloBNEyk7kDEWj+eBNmAC4I\nYL/ga1d+P2PnS7eR6WNQykvCweNtrn93AD56WSt9NkJXmvlq8UCGhqlDCPqJ4uZB\n99dJIzhI8ZFwyYgPnSuVdck0Jej1Zs3buMkrCIesrKGzRyWoCrZH5L5VlI14O0Vm\nGwketAmtAgMBAAECggEAAeK9mn0Z+5Hj9BO7CbaV1OsBnh+XNJDfIVOg7WRVqQsk\ndG7ylIuGLHev7S2e+MIMLnOtsWrWfy3pAc8K+VFFgTH8OZ2BmrQ8ZCwgJan8TBMT\npLtRMc+EHDY1gDQ2CqyooWnUoJIbUoNHC/vuu9qJ6TI5h7E/NZwG3/XUiKUnuSfg\n1CdRWwWk9VqB2ZbYPFK9iT39cPU4rH5fyKnrrTk1Y0eMuFJKVkUW/WKbrIFqJOZK\nqxBPC62yAIqcme/8+dGackNEjo8tCfAOWQn2ZyDZzcc9e3EKt61SRnqETy/RgsyV\nRJNQKEp15H0N2D0F6l38b+1VvtcmQCr/ytPxuZW9gQKBgQDTSzr1nWEpv7ktRaUC\nwq5mfSW8J4+pBA7+kBb7CBIa4nmnGMoZj9a9D1QacXDyKyxv6O4QumFUG2F37e/C\n/n3tKiCVlzABOjH2pYJiKgImW0tU8bEJcgepzyDHb65EvgmMj3UR66qAb4GbpvQ7\nq4NcGTPs7EE7s6ZYZ/FX7pdfTQKBgQC5ioGpqcDS4QmfBKbrkYd39g0Vij8idovn\nIXZjupDf0v1AfuE1x+Kqi9HaC3+vfqR1RW8XOyIiLAaMsnGBWYzvy4SWbCuUZd3k\nKTU88a+Gd6DCyIaFXc9BwkYqJiHFAv4RB49MySnyAEcmoSTeIBbMuld28mZS76Ud\n5nRhtsjj4QKBgFm+jmBcZDSTVlfASQIPJnwpk6mDNCWZr7S4BsrA9s+sefdbNBv/\nWDodFJ/Wpx507/7odJVuVICg0Jlb2oZ8CYh+aDChcqZSzX3xdpuzNA6OoESIE6Xr\nZQ3fCBEtglt4TB4DoLnn2xeKRQaTtxDRHI41tjRfdKWi/Hh4Ta4HjQvRAoGBAIX4\nTaGNMe7SkNjiSgiEPzXOUyo/dVDUGjacwdhGyP7kYPql4sWre647YR44+UxlfCg1\nJ361svLLqTsESdLlL0+iOy1GE72GRE7PtmI3/M5yKIEcu40m7FUGCxW6DN4tR/hR\n5hXClufnbXimGHHO58eRsT/wzROLeET7twMrMSjhAoGBAKf800D224lujf8IhqyW\nApfb01WeAsUjm+iJj8BusX/cxiGq2MEsSN+Ru2S0We+0N6RUZQB6YDqggrQ1ZDyk\n4OvzyU1jUgGhlFov/g5GPMVfnHveoI5Z8M2aaZEsUy7nw39tX3i3AfWyfJlbbc+6\n5/Z/BEo9jDUIoydb+d9aWNno\n-----END PRIVATE KEY-----\n").replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@ideas-parking-lot-28e59.iam.gserviceaccount.com",
  client_id: process.env.FIREBASE_CLIENT_ID || "115760854505224437585",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL || "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40ideas-parking-lot-28e59.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

// MongoDB Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ideas-parking-lot:vk8ctmLdnEghHFRA@exportimporthub.wvsso0s.mongodb.net/?appName=exportimporthub';
const DB_NAME = process.env.DB_NAME || 'ideasParkingLot';

let db, usersCollection, ideasCollection;
let mongoClient;

// MongoDB Connection with Vercel optimization
const connectDB = async () => {
  if (db) return db; // Reuse existing connection for serverless
  
  try {
    mongoClient = new MongoClient(MONGODB_URI, {
      serverApi: { 
        version: ServerApiVersion.v1, 
        strict: true, 
        deprecationErrors: true 
      },
      maxPoolSize: 10,
      minPoolSize: 2,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000
    });
    
    await mongoClient.connect();
    await mongoClient.db('admin').command({ ping: 1 });
    
    db = mongoClient.db(DB_NAME);
    usersCollection = db.collection('users');
    ideasCollection = db.collection('ideas');
    
    // Create indexes
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ firebaseUid: 1 }, { unique: true, sparse: true });
    await ideasCollection.createIndex({ userId: 1 });
    await ideasCollection.createIndex({ category: 1 });
    await ideasCollection.createIndex({ createdAt: -1 });
    
    console.log('✅ MongoDB connected to', DB_NAME);
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

// Middleware
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://your-frontend-domain.vercel.app'
    : 'http://localhost:3000', 
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => { 
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`); 
  next(); 
});

// Firebase Token Authentication Middleware
const authenticateFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required. Please provide a valid Firebase token.' 
      });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token format' 
      });
    }
    
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Attach user info to request
    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email?.split('@')[0],
      picture: decodedToken.picture || null,
      emailVerified: decodedToken.email_verified || false
    };
    
    // Ensure MongoDB connection
    await connectDB();
    
    // Find or create user in MongoDB
    let user = await usersCollection.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      // Create new user if doesn't exist
      const newUser = {
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email?.split('@')[0],
        image: decodedToken.picture || null,
        emailVerified: decodedToken.email_verified || false,
        provider: decodedToken.firebase.sign_in_provider || 'password',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await usersCollection.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    } else {
      // Update user info if exists
      await usersCollection.updateOne(
        { firebaseUid: decodedToken.uid },
        { 
          $set: { 
            name: decodedToken.name || user.name,
            image: decodedToken.picture || user.image,
            emailVerified: decodedToken.email_verified,
            updatedAt: new Date()
          } 
        }
      );
    }
    
    req.user = {
      userId: user._id.toString(),
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name
    };
    
    next();
  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired Firebase token',
      error: error.message 
    });
  }
};

// Validation helper
const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return false;
  }
  return true;
};

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Ideas Parking Lot API with Firebase Authentication', 
    status: 'running', 
    version: '2.0.0',
    auth: 'Firebase'
  });
});

// Health check for Vercel
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Verify Firebase Token (for testing)
app.post('/api/auth/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token is required' 
      });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    res.json({ 
      success: true, 
      message: 'Token is valid',
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      }
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token',
      error: error.message 
    });
  }
});

// Get Current User (requires authentication)
app.get('/api/auth/me', authenticateFirebaseToken, async (req, res) => {
  try {
    const user = await usersCollection.findOne(
      { firebaseUid: req.firebaseUser.uid }, 
      { projection: { _id: 1, name: 1, email: 1, image: 1, provider: 1, createdAt: 1, emailVerified: 1 } }
    );
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      user: { 
        id: user._id.toString(), 
        firebaseUid: req.firebaseUser.uid,
        name: user.name, 
        email: user.email, 
        image: user.image || null, 
        provider: user.provider || 'password',
        emailVerified: user.emailVerified || false,
        createdAt: user.createdAt 
      } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get All Ideas (Public - no auth required)
app.get('/api/ideas', async (req, res) => {
  try {
    await connectDB();
    
    const { search, category, sort = 'createdAt', order = 'desc' } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } }, 
        { shortDescription: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const ideas = await ideasCollection
      .find(query)
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .toArray();
    
    const ideasWithUsers = await Promise.all(ideas.map(async (idea) => {
      const user = await usersCollection.findOne(
        { _id: new ObjectId(idea.userId) }, 
        { projection: { name: 1, email: 1, image: 1 } }
      );
      
      return { 
        ...idea, 
        id: idea._id.toString(), 
        _id: undefined, 
        user: user ? { 
          name: user.name, 
          email: user.email, 
          image: user.image || null 
        } : null 
      };
    }));
    
    res.json({ 
      success: true, 
      count: ideasWithUsers.length, 
      ideas: ideasWithUsers 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get Single Idea (Public)
app.get('/api/ideas/:id', async (req, res) => {
  try {
    await connectDB();
    
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid ID format' 
      });
    }
    
    const idea = await ideasCollection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!idea) {
      return res.status(404).json({ 
        success: false, 
        message: 'Idea not found' 
      });
    }
    
    const user = await usersCollection.findOne(
      { _id: new ObjectId(idea.userId) }, 
      { projection: { name: 1, email: 1, image: 1 } }
    );
    
    res.json({ 
      success: true, 
      idea: { 
        ...idea, 
        id: idea._id.toString(), 
        _id: undefined, 
        user: user ? { 
          name: user.name, 
          email: user.email, 
          image: user.image || null 
        } : null 
      } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get User's Ideas (Protected)
app.get('/api/ideas/user/my-ideas', authenticateFirebaseToken, async (req, res) => {
  try {
    const ideas = await ideasCollection
      .find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({ 
      success: true, 
      count: ideas.length, 
      ideas: ideas.map(idea => ({ 
        ...idea, 
        id: idea._id.toString(), 
        _id: undefined 
      })) 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Create Idea (Protected)
app.post('/api/ideas', authenticateFirebaseToken, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('shortDescription').trim().notEmpty().withMessage('Short description is required'), 
  body('fullDescription').trim().notEmpty().withMessage('Full description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').trim().notEmpty().withMessage('Category is required')
], async (req, res) => {
  try {
    if (!validate(req, res)) return;
    
    const { title, shortDescription, fullDescription, price, category, priority, imageUrl } = req.body;
    
    const newIdea = { 
      userId: req.user.userId, 
      title, 
      shortDescription, 
      fullDescription, 
      price: parseFloat(price), 
      category, 
      priority: priority || 'medium', 
      imageUrl: imageUrl || null, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    
    const result = await ideasCollection.insertOne(newIdea);
    
    res.status(201).json({ 
      success: true, 
      message: 'Idea created successfully', 
      idea: { 
        ...newIdea, 
        id: result.insertedId.toString(), 
        _id: undefined 
      } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create idea', 
      error: error.message 
    });
  }
});

// Update Idea (Protected)
app.put('/api/ideas/:id', authenticateFirebaseToken, [
  body('title').optional().trim().notEmpty(),
  body('shortDescription').optional().trim().notEmpty(),
  body('fullDescription').optional().trim().notEmpty(),
  body('price').optional().isNumeric(),
  body('category').optional().trim().notEmpty()
], async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid ID format' 
      });
    }
    
    if (!validate(req, res)) return;
    
    const idea = await ideasCollection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!idea) {
      return res.status(404).json({ 
        success: false, 
        message: 'Idea not found' 
      });
    }
    
    if (idea.userId !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this idea' 
      });
    }
    
    const updateData = { ...req.body, updatedAt: new Date() };
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }
    
    await ideasCollection.updateOne(
      { _id: new ObjectId(req.params.id) }, 
      { $set: updateData }
    );
    
    const updatedIdea = await ideasCollection.findOne({ _id: new ObjectId(req.params.id) });
    
    res.json({ 
      success: true, 
      message: 'Idea updated successfully', 
      idea: { 
        ...updatedIdea, 
        id: updatedIdea._id.toString(), 
        _id: undefined 
      } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update idea', 
      error: error.message 
    });
  }
});

// Delete Idea (Protected)
app.delete('/api/ideas/:id', authenticateFirebaseToken, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid ID format' 
      });
    }
    
    const idea = await ideasCollection.findOne({ _id: new ObjectId(req.params.id) });
    
    if (!idea) {
      return res.status(404).json({ 
        success: false, 
        message: 'Idea not found' 
      });
    }
    
    if (idea.userId !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this idea' 
      });
    }
    
    await ideasCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    
    res.json({ 
      success: true, 
      message: 'Idea deleted successfully', 
      deletedId: req.params.id 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete idea', 
      error: error.message 
    });
  }
});

// Get Categories
app.get('/api/categories', async (req, res) => {
  try {
    await connectDB();
    
    const categories = await ideasCollection.distinct('category');
    
    res.json({ 
      success: true, 
      categories: categories.filter(cat => cat) 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get Stats (Protected)
app.get('/api/stats', authenticateFirebaseToken, async (req, res) => {
  try {
    const totalIdeas = await ideasCollection.countDocuments({ userId: req.user.userId });
    
    const categoryStats = await ideasCollection.aggregate([
      { $match: { userId: req.user.userId } }, 
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]).toArray();
    
    const priorityStats = await ideasCollection.aggregate([
      { $match: { userId: req.user.userId } }, 
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]).toArray();
    
    res.json({ 
      success: true, 
      stats: { 
        totalIdeas, 
        byCategory: categoryStats, 
        byPriority: priorityStats 
      } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Error Handlers
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found', 
    path: req.path 
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Internal server error' 
  });
});

// Start Server (for local development)
if (process.env.NODE_ENV !== 'production') {
  const startServer = async () => {
    try {
      await connectDB();
      app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log('🔥 Firebase Authentication enabled');
        console.log('📋 API Routes available');
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error.message);
      process.exit(1);
    }
  };
  
  startServer();
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  if (mongoClient) {
    await mongoClient.close();
  }
  process.exit(0);
});

// Export for Vercel serverless
module.exports = app;