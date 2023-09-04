const { default: mongoose } = require("mongoose");

mongoose.connect('mongodb+srv://hok:yGOQsbqJCOfXKeFS@trauxit.jtjto4b.mongodb.net/')
.then(()=>{
    console.log('Connected to DB')
}).catch(()=>{
    console.log('unConnected to DB')
})