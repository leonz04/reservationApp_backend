const request = require('supertest');
const app = require('../app');
const path = require('path');
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');
const multer = require('multer');

let token;
let id;
const file = { path: './testFiles/test.png', filename: 'test.png' }
const imageUrl = 'https://url.com';

jest.mock('../utils/multer.js', () => ({
    single: jest.fn(() => (req, res, next) => {
        req.file = file;
        next();
    })
}))

jest.mock('../utils/cloudinary.js', () => {
    return {
        uploadToCloudinary: jest.fn().mockImplementation(async file => {
            return { url: imageUrl }
        }),
        deleteFromCloudinary: jest.fn()
    }
});


beforeAll(async () => {
    const res = await request(app).post('/users/login').send ({
        email:'test@gmail.com',
        password:'test1234'
    });
    token = res.body.token;
});

test('GET /images debe retornat Estatus 200', async () => {
    const res = await request(app)
        .get('/images')
        .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
});

test('POST /images debe crear una imagen', async () => {
    
    const res = await request(app).post('/images')
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'form-data')
        .attach('image', path.resolve(__dirname, './testFiles/test.png'));

    id = res.body.id;
    console.log(id)

    expect(upload.single).toHaveBeenCalled();
    expect(cloudinary.uploadToCloudinary).toHaveBeenCalledWith(file);
    expect(res.status).toBe(201);
});
    

test('DELETE /images/:id debe eliminar una imagen por su id', async () => {
    console.log(id)
    const res = await request(app)
        .delete(`/images/${id}`)
        .set('Authorization', `Bearer ${token}`);
        console.log(res.body)
    expect(res.status).toBe(204);
    expect(cloudinary.deleteFromCloudinary).toHaveBeenCalledWith(imageUrl);
});