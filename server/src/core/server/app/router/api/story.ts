import { AppOptions } from "coral-server/app";
import {
  activeJSONPHandler,
  countHandler,
  countJSONPHandler,
  ratingsJSONPHandler,
} from "coral-server/app/handlers";
import cacheMiddleware from "coral-server/app/middleware/cache";

import { createAPIRouter } from "./helpers";

export function createStoryRouter(app: AppOptions) {
  const redisCacheDuration = app.config.get("jsonp_cache_max_age");
  const immutable = app.config.get("jsonp_cache_immutable");

  const router = createAPIRouter({ cacheDuration: false, immutable });

  if (app.config.get("jsonp_response_cache")) {
    router.use(cacheMiddleware(app.redis, redisCacheDuration, "count"));
  }

  router.get("/count", countHandler(app));
  router.get("/count.js", countJSONPHandler(app));
  router.get("/active.js", activeJSONPHandler(app));
  router.get("/ratings.js", ratingsJSONPHandler(app));

  return router;
}
