'use strict'

import mongoose from 'mongoose'

export const dbConnection = async () => {
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
        return;
    }
    try {
        console.log("hola")
        mongoose.connection.on('error', () => {
            console.log('MongoDB | no se pudo conectar a mongoDB')
            mongoose.disconnect()
        })

        mongoose.connection.on('connecting', () => {
            console.log('MongoDB | intentado conectar a mongoDB')
        })

        mongoose.connection.on('connected', () => {
            console.log('MongoDB | conectado al servicio de mongoDB')
        })

        mongoose.connection.on('open', () => {
            console.log('MongoDB | conectado a la base de datos')
        })

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB | reconectando a mongoDB')
        })

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB | desconectado de mongoDB')
        })

        await mongoose.connect(process.env.URI_MONGODB, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        })
    } catch (error) {
        console.log(`Error al conectar la db: ${error}`)
    }
}