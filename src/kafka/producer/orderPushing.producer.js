const { Kafka } = require('kafkajs');
const { kafkaConfig } = require('../../config/kafka.config');

class OrderPushingService {
  constructor() {
    this.kafka = new Kafka({
      clientId: kafkaConfig.clientId,
      brokers: kafkaConfig.brokers
    });
    this.producer = this.kafka.producer({
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

  async produce(items, orderId, userLang, userLong) {
    try {
      await this.connect();
      const messages = items.map(({ productId, Qty,cost }) => ({
        key: orderId, 
        value: JSON.stringify({ productId, Qty,cost, userLang, userLong })
    }));
      const messageString = JSON.stringify(messages)
      console.log("Sending to Kafka:", messageString);
      const producingOrderReqToShop = await this.producer.send({
        topic: kafkaConfig.topics.orderNotifications,
        messages: [{ key: orderId, value: messageString }]
      });

      return producingOrderReqToShop;
    }
    catch (error) {
      console.error('Producer connection failed:', error);
      throw error;
    }
  }

  async returnProduction(lang,long,userId,orderId){
    try {
      await this.connect()
      const messages = ({
        key:userId,
        value:JSON.stringify({cost,qty,lang, long })
      })
      const messageString = JSON.stringify(messages)
      console.log("Sending to Kafka:", messageString);
      const producingOrderReqToShop = await this.producer.send({
        topic: kafkaConfig.topics.orderNotifications,
        messages: [{ key: orderId, value: messageString }]
      });
      return producingOrderReqToShop;
    } catch (error) {
      
    }
  }

}

module.exports = OrderPushingService;