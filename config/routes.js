module.exports = app => {
    app.post('/create-order', app.api.orders.createOrder)
    app.post('/create-order-pix', app.api.orders.createOrderPix)
    app.post('/get-course', app.api.orders.getCourse)
    app.post('/get-transaction-orders-status/:orderId', app.api.orders.getTransactionOrdesStatus)
}