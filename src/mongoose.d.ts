import { IReview } from '../models/reviewModel';

declare global {
  namespace mongoose {
    interface Query<ResultType, DocType, THelpers = {}, RawDocType = DocType> {
      r?: IReview;
    }
  }
}
