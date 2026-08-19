const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    const result = await User.updateMany(
      { email: { $in: ['adityajmarch020304@gmail.com', 'shivskukreja@gmail.com'] } },
      { $set: { role: 'admin' } }
    );
    console.log('Updated users:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
