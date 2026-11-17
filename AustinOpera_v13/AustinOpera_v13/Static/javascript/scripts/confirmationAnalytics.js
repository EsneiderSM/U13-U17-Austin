var orderDataNode = document.getElementById("confirmation-dataLayer-data");
var orderData;
if (orderDataNode)
    orderData = JSON.parse(orderDataNode.innerHTML);

if (orderData) {
    try {
        window.dataLayer = window.dataLayer || [];
        dataLayer.push(orderData);
    } catch (err) {
        console.error(err.message);
    }
}
