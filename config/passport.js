const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

// Serialización y deserialización
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Buscar usuario existente
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            // Crear nuevo usuario si no existe
            user = new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value // Asume que siempre hay al menos un email
            });
            await user.save();
        }

        done(null, user);
    } catch (err) {
        done(err, null);  // Manejo de errores
    }
}));

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name'] // Asegura obtener los campos necesarios
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Buscar usuario existente
        let user = await User.findOne({ facebookId: profile.id });

        if (!user) {
            // Crear nuevo usuario si no existe
            user = new User({
                facebookId: profile.id,
                name: `${profile.name.givenName} ${profile.name.familyName}`,
                email: profile.emails ? profile.emails[0].value : undefined
            });
            await user.save();
        }

        done(null, user);
    } catch (err) {
        done(err, null);  // Manejo de errores
    }
}));
