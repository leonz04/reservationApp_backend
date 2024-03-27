const request = require('supertest');
const app = require('../app');

let token;
let id;

beforeAll(async()=>{
    const res = await request(app).post('/users/login').send({
        email:'test@gmail.com',
        password:'test1234'
    });
   token = res.body.token;
});

test('GET /hotels debe retornar un estatus 200', async () => {
    const res = await request(app).get('/hotels');
    console.log(res.body)

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
});

test('POST /hotels debe crear un hotel', async () => {
    const body ={
        name:'hotel test',
        description:'descripcion hotel test',
        price:'50',
        address:'direccion hotel test',
        lat:'en alguna parte del mundo',
        lon:'en alguna parte del mundo'
    }
    const res = await request(app)
        .post('/hotels')
        .send(body)
        .set('Authorization', `Bearer ${token}`);
    id = res.body.id;
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe(body.name);
});

test('GET /hotels/:id debe permitir consultar un hotel por su id', async () => {
    const res = await request(app).get(`/hotels/${id}`)
       .set('Authorization', `Bearer ${token}`);
       console.log(res.body)
    expect(res.status).toBe(200);
});


test('PUT /hotels/:id debe permitir actualizar un hotel por su id', async () => {
    const body ={
        name:'hotel test actualizado'
    };
    const res = await request(app).put(`/hotels/${id}`)
        .send(body)
        .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe(body.name);
});

test('DELETE /hotels/:id debe eliminar el hotel por su id', async () => {
    const res = await request(app)
        .delete(`/hotels/${id}`)
        .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
});
