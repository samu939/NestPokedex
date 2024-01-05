

export const EnvConfiguration = () => ({
    enviroment : process.env.NODE_ENV || 'dev',
    mongoRootLink: process.env.MONGO_ROOT_LINK,
    port: process.env.PORT || 3000,
    defaultLimit: +process.env.DEFAULT_LIMIT || 20
})