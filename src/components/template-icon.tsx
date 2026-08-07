import {
  StarIcon,
  MessageSquareIcon,
  ThumbsUpIcon,
  BarChartIcon,
  QuoteIcon,
} from "@/components/icons";
import type { ReviewTemplateId } from "@/lib/mock-data";

export const templateIcons: Record<
  ReviewTemplateId,
  React.ComponentType<{ className?: string }>
> = {
  star_rating: StarIcon,
  star_comment: MessageSquareIcon,
  thumbs: ThumbsUpIcon,
  nps: BarChartIcon,
  testimonial: QuoteIcon,
};
