
export enum ROLES {
    User = "user",
    Seller = "seller",
    Admin = "admin",
}

export enum PROVIDERS {
    System = "system",
    Google = "google"
}

export enum SUBJECTS {
    ConfirmEmail = "confirm email",
    ResetPassword = "reset password",
    SignIn2fa = "signin step-2fa",
    ResendOtp = 'resend otp'
}

export enum DISCOUNT_TYPE  {
    Fixed_Amount= "fixed_amount",
    Percentage= "percentage",
};

export enum PAYMENT_METHOD {
    Card = "card",
    Cash = "cash"
}

export enum ORDER_STATUS {
    Pending = "pending",
    Placed = "placed",
    On_Way = "on way",
    Delivered = "delivered",
    Cancelled = "cancelled",
    Refunded = "refunded"
}

export enum PRODUCT_SORT {
    PriceAsc = "price:asc",
    PriceDesc = "price:desc",
    CreatedAtAsc = "createdAt:asc",
    CreatedAtDesc = "createdAt:desc",
    DiscountAsc = "discount:asc",
    DiscountDesc = "discount:desc"
}


