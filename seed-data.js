const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Message = require('./models/Message');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ADMIN:Password123@nhd-portal.6o9g1b7.mongodb.net/nhd-portal?retryWrites=true&w=majority';

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Project.deleteMany({});
    await Message.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Get existing users
    const users = await User.find({});
    const adminUser = users.find(u => u.role === 'admin');
    const clientUsers = users.filter(u => u.role === 'client');

    if (!adminUser) {
      console.log('👤 Found admin user:', adminUser.email);
    }

    if (clientUsers.length === 0) {
      console.log('⚠️ No client users found. Creating sample clients...');
      
      // Create sample clients
      const boldCoffee = new User({
        name: 'Sarah Johnson',
        email: 'sarah@boldcoffee.com',
        password: 'password123',
        company: 'Bold Coffee',
        role: 'client'
      });

      const jacksRetail = new User({
        name: 'Jack Thompson',
        email: 'jack@jacksretail.com',
        password: 'password123',
        company: 'Jack\'s Country Retail Store',
        role: 'client'
      });

      await boldCoffee.save();
      await jacksRetail.save();
      
      clientUsers.push(boldCoffee, jacksRetail);
      console.log('✅ Created sample clients');
    }

    // Create projects for Bold Coffee
    const boldCoffeeUser = clientUsers.find(u => u.company === 'Bold Coffee');
    if (boldCoffeeUser) {
      const boldCoffeeProjects = [
        {
          name: 'Bold Coffee Brand Identity',
          description: 'Complete brand identity package including logo, color palette, typography, and brand guidelines for Bold Coffee\'s new premium coffee line.',
          clientId: boldCoffeeUser._id,
          status: 'in-progress',
          priority: 'high',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-03-15'),
          budget: 15000,
          progress: 65,
          deliverables: [
            { name: 'Logo Design', description: 'Primary and secondary logo variations', dueDate: new Date('2024-02-01'), status: 'completed' },
            { name: 'Color Palette', description: 'Brand color system with hex codes', dueDate: new Date('2024-02-15'), status: 'completed' },
            { name: 'Typography Guide', description: 'Font selection and usage guidelines', dueDate: new Date('2024-02-28'), status: 'in-progress' },
            { name: 'Brand Guidelines', description: 'Complete brand manual', dueDate: new Date('2024-03-15'), status: 'pending' }
          ],
          teamMembers: [
            { name: 'Alex Chen', role: 'Lead Designer', email: 'alex@northheaddigital.com' },
            { name: 'Maria Rodriguez', role: 'Brand Strategist', email: 'maria@northheaddigital.com' }
          ]
        },
        {
          name: 'Bold Coffee Website Redesign',
          description: 'Modern, responsive website redesign for Bold Coffee\'s online presence with e-commerce integration.',
          clientId: boldCoffeeUser._id,
          status: 'planning',
          priority: 'medium',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-05-01'),
          budget: 25000,
          progress: 15,
          deliverables: [
            { name: 'Wireframes', description: 'Site structure and user flow', dueDate: new Date('2024-03-15'), status: 'pending' },
            { name: 'UI Design', description: 'Visual design mockups', dueDate: new Date('2024-04-01'), status: 'pending' },
            { name: 'Development', description: 'Frontend and backend development', dueDate: new Date('2024-04-15'), status: 'pending' },
            { name: 'Testing & Launch', description: 'Quality assurance and deployment', dueDate: new Date('2024-05-01'), status: 'pending' }
          ]
        }
      ];

      for (const projectData of boldCoffeeProjects) {
        const project = new Project(projectData);
        await project.save();
      }
      console.log('☕ Created Bold Coffee projects');
    }

    // Create projects for Jack's Country Retail Store
    const jacksUser = clientUsers.find(u => u.company === 'Jack\'s Country Retail Store');
    if (jacksUser) {
      const jacksProjects = [
        {
          name: 'Jack\'s Store Signage Package',
          description: 'Complete signage design and installation for Jack\'s Country Retail Store including storefront signs, interior wayfinding, and promotional displays.',
          clientId: jacksUser._id,
          status: 'completed',
          priority: 'high',
          startDate: new Date('2023-11-01'),
          endDate: new Date('2023-12-15'),
          budget: 8500,
          progress: 100,
          deliverables: [
            { name: 'Storefront Sign', description: 'Main storefront sign design and installation', dueDate: new Date('2023-11-15'), status: 'completed' },
            { name: 'Interior Wayfinding', description: 'Directional signs and department labels', dueDate: new Date('2023-11-30'), status: 'completed' },
            { name: 'Promotional Displays', description: 'Seasonal promotional signage', dueDate: new Date('2023-12-15'), status: 'completed' }
          ]
        },
        {
          name: 'Jack\'s Marketing Campaign',
          description: 'Comprehensive marketing campaign for Jack\'s Country Retail Store including print materials, social media graphics, and promotional content.',
          clientId: jacksUser._id,
          status: 'in-progress',
          priority: 'medium',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-04-30'),
          budget: 12000,
          progress: 40,
          deliverables: [
            { name: 'Print Materials', description: 'Flyers, posters, and brochures', dueDate: new Date('2024-02-15'), status: 'completed' },
            { name: 'Social Media Graphics', description: 'Facebook, Instagram, and Twitter graphics', dueDate: new Date('2024-03-01'), status: 'in-progress' },
            { name: 'Email Templates', description: 'Newsletter and promotional email designs', dueDate: new Date('2024-03-15'), status: 'pending' },
            { name: 'Video Content', description: 'Promotional videos for social media', dueDate: new Date('2024-04-30'), status: 'pending' }
          ]
        }
      ];

      for (const projectData of jacksProjects) {
        const project = new Project(projectData);
        await project.save();
      }
      console.log('🏪 Created Jack\'s Country Retail Store projects');
    }

    // Create messages for each client
    if (boldCoffeeUser && adminUser) {
      const boldCoffeeMessages = [
        {
          subject: 'Brand Identity Progress Update',
          content: 'Hi Sarah! We\'ve made excellent progress on your brand identity package. The logo designs are complete and we\'re moving forward with the typography guide. I\'ll have the first draft ready for your review by next Friday.',
          clientId: boldCoffeeUser._id,
          senderId: adminUser._id,
          senderName: adminUser.name,
          priority: 'medium',
          category: 'project-update',
          isRead: false
        },
        {
          subject: 'Color Palette Approval Needed',
          content: 'The color palette for Bold Coffee is ready for your review. We\'ve created three variations - please let me know which direction you prefer. The warm earth tones really capture the premium coffee aesthetic.',
          clientId: boldCoffeeUser._id,
          senderId: adminUser._id,
          senderName: adminUser.name,
          priority: 'high',
          category: 'feedback',
          isRead: true
        }
      ];

      for (const messageData of boldCoffeeMessages) {
        const message = new Message(messageData);
        await message.save();
      }
      console.log('📧 Created Bold Coffee messages');
    }

    if (jacksUser && adminUser) {
      const jacksMessages = [
        {
          subject: 'Store Signage Installation Complete',
          content: 'Hi Jack! The signage installation is complete and looks fantastic. The new storefront sign really makes your store stand out on Main Street. The interior wayfinding is helping customers navigate much better.',
          clientId: jacksUser._id,
          senderId: adminUser._id,
          senderName: adminUser.name,
          priority: 'low',
          category: 'project-update',
          isRead: true
        },
        {
          subject: 'Marketing Campaign Next Steps',
          content: 'Great news! The print materials for your marketing campaign are ready. We\'re now moving into the social media graphics phase. I\'d love to schedule a call to discuss the content strategy and get your input on the visual direction.',
          clientId: jacksUser._id,
          senderId: adminUser._id,
          senderName: adminUser.name,
          priority: 'medium',
          category: 'project-update',
          isRead: false
        }
      ];

      for (const messageData of jacksMessages) {
        const message = new Message(messageData);
        await message.save();
      }
      console.log('📧 Created Jack\'s Country Retail Store messages');
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`📁 Projects: ${await Project.countDocuments()}`);
    console.log(`📧 Messages: ${await Message.countDocuments()}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedData();
