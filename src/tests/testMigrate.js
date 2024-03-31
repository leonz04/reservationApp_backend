
const User = require('../models/User');
const sequelize = require('../utils/connection');
const bcrypt =require('bcrypt')

const main = async() => {

    try{
        // Acciones a ejecutar antes de los tests
        sequelize.sync();
        const exists=await User.findOne({where:{email:'test@gmail.com'}})
        if(!exists){
            await User.create({
                firstName:"user firstName",
                 lastName: "user lastName",
                 email:"test@gmail.com",
                 password:await bcrypt.hash('test1234',10),
                 gender:"Other",
                 isVerified:true,
                 rol:"user"
            })
        }
        
 
        
        process.exit();
    } catch(error){
        console.log(error);
    }
}

main();