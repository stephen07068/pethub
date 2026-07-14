from ..extensions import db
from ..models.settings import Settings


class SettingsService:

    @staticmethod
    def get():
        """Return the singleton settings record."""
        s = Settings.query.get(1)
        if not s:
            s = Settings(id=1)
            db.session.add(s)
            db.session.commit()
        return s.to_dict()

    @staticmethod
    def update(data: dict):
        s = Settings.query.get(1)
        if not s:
            s = Settings(id=1)
            db.session.add(s)

        for field in ["store_name", "shipping_fee", "support_email",
                      "support_phone", "business_address", "currency", 
                      "low_stock_threshold"]:
            if field in data:
                setattr(s, field, data[field])

        db.session.commit()
        return s.to_dict()
