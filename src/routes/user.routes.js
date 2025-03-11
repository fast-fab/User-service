const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();
const kafkaService = require("../kafka/producer/orderPushing.producer")
const kafka = new kafkaService()
const axios = require('axios')
const authMiddleware = require("../middleware/auth.middleware")
const STATUS_TYPE = require("../utils/objects")

// 1. NEED LOCATION THING / GOOGLE API TO GIVE OUT LANG AND LAT
// 2. push to kafka's particular topic
router.use(express.json())

router.get("/bulk", async (req, res) => {
    try {
        const getItems = axios.get("https://api.fastandfab.in/api/products/all")
        res.json(getItems);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: "Server error" });
    }
});

// yeh bohot slow hojayega
router.get("/bulk/:id", async (req, res) => {
    try {
        const getItems = axios.get("https://api.fastandfab.in/api/products/:productId")
        if (!getItems) { return res.status(404).json({ error: "Product not found" }); }
        res.json(getItems);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.post('/createOrder', authMiddleware, async (req, res) => {
    try {
        const { userId, items } = req.body;

        if (!userId || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Invalid request format" });
        }
        items.forEach(item => console.log("productId", item.productId));
        const order = await prisma.order.create({
            data: {
                userId,
                items: {
                    create: items.map(item => ({
                        productId: item.productId,
                        qty: item.qty,
                        cost: item.cost,
                        status: STATUS_TYPE.ORDERED
                    }))
                }
            },
            include: { items: true }
        });
        const userLang = 12.2
        const userLong = 12.1
        // send kafka 
        // Send to Kafka
        try {
            const pushData = await kafka.produce(items, userId, userLang, userLong);
            console.log(pushData);
        } catch (error) {
            console.error("Error sending data to Kafka:", error);
        }


        res.status(201).json({ message: "Order placed", order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/return",authMiddleware, async (req, res) => {
    try {
        const {orderId,idArticle,qty} = req.body;

        const userId=req.user.id

        if (!orderId ) {
            return res.status(400).json({ error: "Invalid return request" });
        }
        const findorderId=await prisma.order.findUnique({
            where:{orderId},
            include:{
                items:true
            }
        })
        const article = findorderId.items.find((item) => item.id === idArticle);
        if(article.qty<qty){
            return res.send("qty returned cannot be more than ordered")
        }
        console.log(article.id)
        const totalCost = qty * article.cost;

        const returnedItem = await prisma.returns.create({
            data: {
                ProductId: idArticle,
                qty: qty,
                totalCost: totalCost
            }
        });
        const data=await prisma.user.findUnique({
            where:{id:userId}
        })
        // send kafka
        const response=await kafka.returnProduction(data.lang,data.long,userId,orderId)
        res.status(201).json({ message: "Return processed", returnedItem });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/previousOrders/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: true
            }
        });

        if (!orders.length) return res.status(404).json({ error: "No previous orders found" });

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});


module.exports=router