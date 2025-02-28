const { Kafka } = require('kafkajs');
const kafkaConfig = require('../../config/kafka.config');
const { PrismaClient } = require('@prisma/client'); // Changed to CommonJS style
const prisma = new PrismaClient();

class OrderPushingService {
  constructor() {
    this.kafka = new Kafka({
      clientId: kafkaConfig.clientId,
      brokers: kafkaConfig.brokers
    });
    this.producer = this.kafka.producer({ // Changed produce to producer
      allowAutoTopicCreation: true
    });
  }

  async connect() {
    try {
      await this.producer.connect();
      console.log('Producer connected successfully');
    } catch (error) {
      console.error('Producer connection failed:', error);
      throw error;
    }
  }

  async produce(itemId, orderId, Qty, userLang, userLong) {
    try {
      await this.connect();
      const producingOrderReqToShop = await this.producer.send({ 
        topic: kafkaConfig.topics.orderNotifications, // Added topics. based on your consumer code
        messages: [
          { 
            key: orderId, 
            value: JSON.stringify({ // Wrapped values in an object
              itemId, 
              Qty, 
              userLang, 
              userLong
            })
          },
        ],
      });
      console.log(producingOrderReqToShop);
    } catch (error) { // Changed e to error to match the log statement
      console.error('Producer connection failed:', error);
      throw error;
    }
  }
}

module.exports = OrderPushingService; // Added export
