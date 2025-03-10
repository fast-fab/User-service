const express = require('express');
const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();
const kafkaService = require("../kafka/producer/orderPushing.producer")
const kafka = new kafkaService()
const axios = require('axios')
const authMiddleware = require("../middleware/auth.middleware")
const STATUS_TYPE = require("../utils/objects")

// 1. NEED LOCATION THING / GOOGLE API TO GIVE OUT LANG AND LAT
// 2. push to kafka's particular topic
app.use(express.json())

app.get("/bulk", async (req, res) => {
    try {
        const getItems = axios.get("https://api.fastandfab.in/api/products/all")
        res.json(getItems);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: "Server error" });
    }
});

// yeh bohot slow hojayega
app.get("/bulk/:id", async (req, res) => {
    try {
        const getItems = axios.get("https://api.fastandfab.in/api/products/:productId")
        if (!getItems) { return res.status(404).json({ error: "Product not found" }); }
        res.json(getItems);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post('/createOrder', authMiddleware, async (req, res) => {
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

app.post("/return", async (req, res) => {
    try {
        const { productId, qty, cost } = req.body;

        if (!productId || !qty || !cost) {
            return res.status(400).json({ error: "Invalid return request" });
        }

        const findQuantity = await prisma.orderItem.findMany({
            where: { productId },
            select: { qty }
        });

        // Sum up the total ordered quantity
        const totalOrderedQty = findQuantity.reduce((sum, item) => sum + item.qty, 0);

        if (qty > totalOrderedQty) {
            return res.status(400).json({
                message: "Return quantity cannot be greater than ordered quantity"
            });
        }

        // Find the specific order item (must use `id`, not `productId`)
        const findProduct = await prisma.orderItem.findUnique({
            where: { id: productId } // Use OrderItem ID, not productId
        });

        if (!findProduct) {
            console.log("OrderItem not found:", productId);
            return res.status(400).json({ message: "Order item not found" });
        }

        const product = await prisma.product.findUnique({
            where: { id: findProduct.productId } // Corrected to use `productId`
        });

        if (!product) {
            console.log("Product not found for OrderItem:", findProduct.productId);
            return res.status(400).json({ message: "Product not found" });
        }

        const totalCost = qty * cost;

        const returnedItem = await prisma.returns.create({
            data: {
                ProductId: product.id,
                cost: cost,
                Status: "RETURNED",
                totalCost: totalCost
            }
        });
        // send kafka
        res.status(201).json({ message: "Return processed", returnedItem });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/previousOrders/:userId", async (req, res) => {
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

// module.exports=app
app.listen(3000)