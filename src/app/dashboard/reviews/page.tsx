import { AllReviewsView } from "@/app/dashboard/reviews/reviews-view";
import { getAllReviews } from "@/lib/reviews/queries";

export default async function AllReviewsPage() {
  const reviews = await getAllReviews();
  return <AllReviewsView reviews={reviews} />;
}
