import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config({ path: "./.env" });

const stripe = new Stripe(process.env.API_KEY);

((/* simple charges call using Promises */) => {
  const charge = stripe.charges.create({
    amount: 2000,
    currency: "usd",
    source: "tok_amex",
    description: "test charge"
  });

  charge
    .then((c: Stripe.Charge) => {
      const green = [
        c.fraud_details.stripe_report,
        c.fraud_details.user_report,
        c.outcome.network_status,
        c.outcome.seller_message,
        c.payment_method_details.ach_credit_transfer.routing_number,
        c.payment_method_details.multibanco.entity,
        c.refunds.data.map(refund => refund.id),
        c.shipping.address.city,
        c.refunds.has_more
      ];

      const red = [c.refunds.url, c.refunds.object];
    })
    .catch(error => {});
})();

(async (/* simple charges call using async await */) => {
  try {
    const c = await stripe.charges.create({
      amount: 2000,
      currency: "usd",
      source: "tok_visa",
      description: "test charge"
    });

    const green = [
      c.fraud_details.stripe_report,
      c.fraud_details.user_report,
      c.outcome.network_status,
      c.outcome.seller_message,
      c.payment_method_details.ach_credit_transfer.routing_number,
      c.payment_method_details.multibanco.entity,
      c.shipping.address.city
    ];
  } catch (error) {}
})();

(async (/* expanding a property on the charge */) => {
  try {
    const customer = await stripe.customers.create({
      source: "tok_visa",
      name: "Jane Doe",
      // The address is well typed +1
      address: {
        line1: "88 Scott St."
      }
    });

    const c = await stripe.charges.create({
      amount: 2000,
      currency: "usd",
      customer: customer.id,
      description: "test charge",
      expand: ["customer"]
    });

    const red = [c.customer.address.line1];
  } catch (error) {
    console.log("ooops", error);
  }
})();

((/* initializing with a config */) => {
  const extraConfiguredStripe = new Stripe(process.env.API_KEY, {
    apiVersion: "2019-08-08",
    maxNetworkRetries: 1,
    timeout: 1000,
    host: "api.example.com",
    port: 123,
    telemetry: true
  });

  const green = [extraConfiguredStripe.paymentIntents];
})();

((/* timeout */) => {
  stripe.setTimeout(3000);
})();

((/* Retrieve the balance for a connected account */) => {
  // https://stripe.com/docs/connect/account-balances#accounting-for-negative-balances
  stripe.balance.retrieve(
    {
      stripe_account: "{{CONNECTED_STRIPE_ACCOUNT_ID}}"
    },
    function(err, balance) {
      console.log({ err, balance });
      // asynchronously called
    }
  );

  // https://github.com/stripe/stripe-node#webhook-signing
  // Retrieve the balance for a connected account:
  stripe.balance
    .retrieve({
      stripeAccount: "acct_foo"
    })
    .then(balance => {
      console.log({ balance });
      // The balance object for the connected account
    })
    .catch(err => {
      console.log({ err });
      // Error
    });
})();

((/* request and response handlers */) => {
  // Add the event handler function:
  stripe.on("request", event => {
    event.account;
    event.api_version;
    event.idempotency_key;
    event.method;
    event.path;
    event.request_start_time;
  });

  // Remove the event handler function:
  stripe.off("request", event => {
    event.account;
    event.api_version;
    event.idempotency_key;
    event.method;
    event.path;
    event.request_start_time;
  });
})();

((/* webhook siging */) => {
  const event = stripe.webhooks.constructEvent(
    "req_body",
    "header",
    "signing-secret"
  );
  const header = stripe.webhooks.generateTestHeaderString({
    timestamp: 123,
    payload: "payload",
    secret: "secret",
    signature: "sig"
  });
})();

((/* write a plugin */) => {
  stripe.setAppInfo({
    name: "MyAwesomePlugin",
    version: "1.2.34", // Optional
    url: "https://myawesomeplugin.info" // Optional
  });
})();

(async (/* async iterator */) => {
  for await (const customer of stripe.customers.list({ limit: 3 })) {
    // Do something with customer
  }
})();

(async (/* auto paging each */) => {
  stripe.customers.list({ limit: 3 }).autoPagingEach(function(customer) {
    // Do something with customer
  });
})();

(async (/* auto paging to array */) => {
  const allNewCustomers = await stripe.customers
    .list()
    .autoPagingToArray({ limit: 10000 });
})();

((/* latency telemetry */) => {
  stripe.setTelemetryEnabled(false);
})();
