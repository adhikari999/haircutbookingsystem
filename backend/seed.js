const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hairstyle = require('./models/Hairstyle');
const User = require('./models/User');

dotenv.config();

const hairstyles = [
  {
    name: 'The Modern Pompadour',
    description: 'A classic voluminous top with short, clean sides for a sharp, refined profile.',
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f013d899a?q=80&w=1288&auto=format&fit=crop',
    price: 800,
    category: 'Short',
  },
  {
    name: 'Signature Fade',
    description: 'Ultra-clean skin fade transition with a textured crop on top.',
    image: 'https://images.unsplash.com/photo-1621605815841-28d9446e364f?q=80&w=1170&auto=format&fit=crop',
    price: 600,
    category: 'Short',
  },
  {
    name: 'Classic Side Part',
    description: 'Timeless professional look with a hard-part line and medium length.',
    image: 'https://images.unsplash.com/photo-1593702295094-172f37c35e98?q=80&w=1170&auto=format&fit=crop',
    price: 700,
    category: 'Medium',
  },
  {
    name: 'Textured Quiff',
    description: 'Versatile messy-yet-stylish quiff with high volume.',
    image: 'https://images.unsplash.com/photo-1622286332613-2051676ed22d?q=80&w=1287&auto=format&fit=crop',
    price: 650,
    category: 'Medium',
  },
  {
    name: 'Luxury Beard Sculpt',
    description: 'Precision beard shaping with hot towel treatment and premium beard balm.',
    image: 'https://images.unsplash.com/photo-1517441113066-5c5f2479f67a?q=80&w=1170&auto=format&fit=crop',
    price: 500,
    category: 'Beard',
  },
  {
    name: 'Long Layered Cut',
    description: 'Expertly layered long hair for natural movement and flow.',
    image: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?q=80&w=1170&auto=format&fit=crop',
    price: 900,
    category: 'Long',
  },
];

const barbers = [
  {
    name: 'Master Alex Shrestha',
    email: 'alex@easycut.com',
    phone: '9801234567',
    password: 'barber123',
    role: 'barber',
    isVerified: true,
    specialization: 'Fades & Modern Styles',
    experience: '8 years',
  },
  {
    name: 'Barber Raju Tamang',
    email: 'raju@easycut.com',
    phone: '9807654321',
    password: 'barber123',
    role: 'barber',
    isVerified: true,
    specialization: 'Classic Cuts & Beard',
    experience: '5 years',
  },
  {
    name: 'Krishna Hair Studio',
    email: 'krishna@easycut.com',
    phone: '9812345678',
    password: 'barber123',
    role: 'barber',
    isVerified: true,
    specialization: 'Premium Styling & Colors',
    experience: '10 years',
  },
  {
    name: 'Suresh Barber Pro',
    email: 'suresh@easycut.com',
    phone: '9809876543',
    password: 'barber123',
    role: 'barber',
    isVerified: false, // pending verification
    specialization: 'Traditional Shaves',
    experience: '3 years',
  },
];

const admin = {
  name: 'Admin EasyCut',
  email: 'admin@easycut.com',
  phone: '9800000001',
  password: 'admin@123',
  role: 'adminadmin@123',
  isVerified: true,
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Hairstyles
    await Hairstyle.deleteMany({});
    await Hairstyle.insertMany(hairstyles);
    console.log('Hairstyles seeded!');

    // Admin
    const adminExists = await User.findOne({ email: admin.email });
    if (!adminExists) {
      await User.create(admin);
      console.log('Admin created: admin@easycut.com / admin@123');
    } else {
      console.log('Admin already exists.');
    }

    // Barbers
    for (const b of barbers) {
      const exists = await User.findOne({ email: b.email });
      if (!exists) {
        await User.create(b);
        console.log(`Barber created: ${b.email}`);
      }
    }

    mongoose.disconnect();
    console.log('\nSeeding complete!');
    console.log('Admin login: admin@easycut.com / admin@123');
    console.log('Barber login: alex@easycut.com / barber123');
  } catch (err) {
    console.error('Error seeding:', err);
    process.exit(1);
  }
};

seedDB();
