import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";
import { Order, OrderSchema } from "src/schemas/order.schema";
import { Product, ProductSchema } from "src/schemas/product.schema";
import { Review, ReviewSchema } from "src/schemas/review.schema";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";
import { User, UserSchema } from "src/schemas/user.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Review.name, schema: ReviewSchema},
            {name: Order.name, schema: OrderSchema},
            {name: User.name, schema: UserSchema},
            {name: Product.name, schema: ProductSchema}
        ]),
        AuthModule
    ],
    controllers: [ReviewsController],
    providers: [ReviewsService],
    exports: [ReviewsService],
})

export class ReviewsModule {}