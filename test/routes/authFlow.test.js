process.env.NODE_ENV='test';
const chai=require('chai');
// import chai from 'chai';
const mocha=require('mocha');
const sinon=require('sinon');
const chaiHttp=require('chai-http');
const {beforeEach, afterEach}=require('mocha');
const expect=require('chai').expect;
const server=require('../../src/app');
chai.use(chaiHttp);
// console.log("server",server)
// const endpoint = 'http://127.0.0.1:3008';

let signupBody={
    "fullName":"test user",
    "email":"test1223@gmail.com",
    "phone":9876541432,
    "password":"xyz",
    "role":"normal",
    "date_of_birth":"1995-09-23"
}

describe('Verifies the signup flow with the actual MongoDB calls',()=>{
    it('Signup is successful',(done)=>{
        chai.request(server).post('/users/signup').send(signupBody).end((err, res)=>{
            // console.log("res.body---> ",res)
            expect(res.status).equal(200);
            expect(res.body.message).equal('User saved successfully');
            done()
        })

    })
    it('email validation fails',(done)=>{
        signupBody.email="test1223@@@@gmail.com";
        chai.request(server).post('/users/signup').send(signupBody).end((err, res)=>{
            expect(res.status).equal(500);
            expect(res.body.message._message).equal('User validation failed');
            // expect(res.body.message.message).equal(`User validation failed: email: email is not a valid email!`)
            done()
        })
    })
    it('Registration failing due to role is other than normal/admin', (done)=>{
        signupBody.email="test1223@gmail.com";
        signupBody.role='shakil';
        chai.request(server).post('/users/signup').send(signupBody).end((err, res)=>{
            expect(res.status).equal(500);
            expect(res.body.message._message).equal('User validation failed');
            done()
        })
    })
    it('Registration failing due to password missing field', (done)=>{
        signupBody.email="test1223@gmail.com";
        signupBody.role="normal"
        delete signupBody['password'];
        chai.request(server).post('/users/signup').send(signupBody).end((err, res)=>{
            console.log("res.body---> ",res.body)
            expect(res.status).equal(400);
            expect(res.body.message).equal('Password is required');
            done()
        })
    })
})


describe('verifies the SignIn flow',()=>{
    beforeEach((done)=>{
        let signupBody={
            "fullName":"test user",
            "email":"test1223@gmail.com",
            "phone":9876541432,
            "password":"xyz",
            "role":"normal",
            "date_of_birth":"1995-09-23"
        }
        chai.request(server).post('/users/signup').send(signupBody).end((err,res)=>{
            done()
        })
    })
    it('Successful sign in', (done)=>{
        let signInBody={
            email:'test1223@gmail.com',
            password:'xyz'
        }
        chai.request(server).post('/users/login').send(signInBody).end((err,res)=>{
            expect(res.status).equal(200);
            expect(res.body.message).equal('Login Successful');
            expect(res.body.user.email).equal('test1223@gmail.com');
            expect(res.body).to.have.property('accessToken');
            done()
        })
    })
    it('Invalid Password', (done)=>{
        let signInBody={
            email:'test1223@gmail.com',
            password:'123456'
        }
        chai.request(server).post('/users/login').send(signInBody).end((err,res)=>{
            expect(res.status).equal(401);
            expect(res.body.message).equal("Invalid Password!");
            expect(res.body.accessToken).to.be.undefined;
            done();
    })
    })
    it('User Not registered', (done)=>{
        let signInBody={
            email:'test123@gmail.com',
            password:'xyz'
        }
        chai.request(server).post('/users/login').send(signInBody).end((err, res)=>{
            expect(res.status).equal(404);
            expect(res.body.message).equal("User not found");
            done()
        })
    })
})