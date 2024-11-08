import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51Q8j94FwWLMhNjzrtCDxyiMomhZ1OOze0cckhXApEmRBK4xrPvldvoSEMrAAel74GRqoakXHpcEZbjYxrDRXqB7400s5l7IqWa',
);

export const bookTour = async (tourId) => {
  try {
    // GET CHECKOUT SESSION FROM SERVER
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // CREATE CHECKOUT FORM + CHARGE CREDIT CARD
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err.message || 'Somthing went wrong');
  }
};
