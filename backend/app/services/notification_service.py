from flask import current_app
from ..models.order import Order


class NotificationService:
    """
    Service responsible for sending notifications (Email, SMS, internal alerts).
    Currently implemented as mock stubs that output to the structured application log.
    """

    @staticmethod
    def send_order_confirmation(order: Order):
        current_app.logger.info(
            "NOTIFICATION [Order Confirmation] "
            f"To: {order.customer_email} | "
            f"Subject: Your PetStore Hub Order #{order.order_number} "
            f"| Total: ${order.total_amount}"
        )

    @staticmethod
    def send_shipping_update(order: Order):
        current_app.logger.info(
            "NOTIFICATION [Shipping Update] "
            f"To: {order.customer_email} | "
            f"Subject: Order #{order.order_number} has shipped!"
        )

    @staticmethod
    def send_delivery_confirmation(order: Order):
        current_app.logger.info(
            "NOTIFICATION [Delivery Confirmation] "
            f"To: {order.customer_email} | "
            f"Subject: Order #{order.order_number} has been delivered!"
        )

    @staticmethod
    def send_payment_failure(order: Order):
        current_app.logger.warning(
            "NOTIFICATION [Payment Failure] "
            f"To: {order.customer_email} | "
            f"Subject: Action Required: Payment failed for Order #{order.order_number}"
        )

    @staticmethod
    def send_admin_new_order_alert(order: Order):
        admin_email = current_app.config.get("ADMIN_EMAIL", "admin@petstorehub.com")
        current_app.logger.info(
            "NOTIFICATION [Admin Alert] "
            f"To: {admin_email} | "
            f"Subject: New Order Received - #{order.order_number}"
        )
