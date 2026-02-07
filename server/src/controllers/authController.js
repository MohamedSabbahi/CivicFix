const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d',
    })
}

exports.register = async (req, res) => {
    try{
        const { name, email, password } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if(existingUser){
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'CITIZEN',
            },
        });

        res.status(201).json({
            id: user.id,
            name: user.name,
            emai: user.email,
            role:user.role,
            token: generateToken(user.id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during Registration' });
    }
};

exports.login = async (req, res) => {

    //We check if there are validation errors. if any, we return 400 with the errors array.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if(!user || !(await bcrypt.compare(password, user.password))){
            return res.status(400).json({ message: 'Invalid credentials'});
        }
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id),
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error during Login' });
    }
};

exports.getMe = async (req, res) => {
    res.status(200).json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
    });
};