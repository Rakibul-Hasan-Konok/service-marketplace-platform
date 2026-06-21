# Service Marketplace ERD

```mermaid
erDiagram
  USER ||--o| VENDOR_PROFILE : "has vendor profile"
  USER ||--o{ ORDER : "places as end-user"
  VENDOR_PROFILE ||--o{ SERVICE : "owns"
  CATEGORY ||--o{ SERVICE : "classifies"
  SERVICE ||--o{ ORDER : "booked through"
  ORDER ||--o| TRANSACTION : "paid by"

  USER {
    string id PK
    string name
    string email UK
    string passwordHash
    Role role "ADMIN|VENDOR|END_USER"
    datetime createdAt
  }
  VENDOR_PROFILE {
    string id PK
    string userId FK_UK
    string businessName
    string description
    boolean verified
    boolean suspended
    datetime createdAt
  }
  CATEGORY {
    string id PK
    string name UK
  }
  SERVICE {
    string id PK
    string vendorProfileId FK
    string categoryId FK
    string title
    string description
    decimal price
    boolean isActive
    datetime createdAt
    datetime updatedAt
  }
  ORDER {
    string id PK
    string endUserId FK
    string serviceId FK
    OrderStatus status "PENDING|CONFIRMED|COMPLETED|CANCELLED"
    datetime scheduledDate
    decimal totalAmount
    datetime createdAt
    datetime updatedAt
  }
  TRANSACTION {
    string id PK
    string orderId FK_UK
    string paymentReference
    TransactionStatus status "PENDING|SUCCESS|FAILED"
    json gatewayResponse
    datetime createdAt
  }
```

## Design choices

`Order` and `Transaction` are intentionally separated. A booking can exist as `PENDING` while payment is attempted, retried, failed, or audited independently. This keeps booking lifecycle data separate from gateway response data and makes failed sandbox payments traceable without incorrectly confirming an order.

Services use `isActive` as a soft-delete strategy so historical orders keep a valid service reference and vendors can deactivate listings without breaking reports. User deletion is restricted for orders to protect financial and booking history. Vendor profiles cascade from users because the profile cannot exist without the vendor account.

Indexes are added on high-traffic lookup fields: `User.email` for login, `Service.categoryId`, `Service.isActive`, and `Service.title` for catalog filtering/search, plus `Order.status`, `Order.endUserId`, and `Order.serviceId` for dashboards and role-specific order queries. Vendor resource ownership is enforced in backend queries, not only through frontend route visibility.
