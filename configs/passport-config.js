const passport = require('passport');
const passportJWT = require('passport-jwt');
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  issuer:'<project-name>',
};

const verifyCallback = async (jwtPayload, done)=>{
  try{
    return done(null, jwtPayload.sub);
  }catch(err){
    return done(err);
  }
};

const strategy = new JwtStrategy(opts,verifyCallback);

passport.use(strategy);
