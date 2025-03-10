const kafkaConfig = {
    clientId: 'user-service',
    brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9093'],
    topics: {
      orderNotifications: 'order-notifications',
    }
  }; 
  
  console.log(kafkaConfig.brokers)


module.exports={
  kafkaConfig
}