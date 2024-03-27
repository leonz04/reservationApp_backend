const request = require ('supertest');
const app = require ('../app');

let token;
let id;

beforeAll(async () => {
    const res = await request(app).post('/users/login').send ({
        email:'test@gmail.com',
        password:'test1234'
    });
    token = res.body.token;
});

test('GET /bookings debe retornat Estatus 200', async () => {
    const res = await request(app)
        .get('/bookings')
        .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
});

test('POST /bookings debe crear una booking', async () => {
    const body = {
        checkIn:'2024-03-23T00:00:00.000Z',
        checkOut:'2024-03-24T00:00:00.000Z',
    };
    const res = await request(app)
        .post('/bookings')
        .send(body)
        .set('Authorization', `Bearer ${token}`);
    id = res.body.id;
    console.log(res.body)

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.checkIn).toBe(body.checkIn);
});

test('PUT /bookings/:id debe permitir actualizar una reserva por su id', async () => {
    const body ={
        checkIn:'2024-03-23T08:00:00.000Z'
    };
    const res = await request(app).put(`/bookings/${id}`)
        .send(body)
        .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.checkIn).toBe(body.checkIn);
});

test('DELETE /bookings/:id debe eliminar una booking por su id', async () => {
    const res = await request(app)
        .delete(`/bookings/${id}`)
        .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
});