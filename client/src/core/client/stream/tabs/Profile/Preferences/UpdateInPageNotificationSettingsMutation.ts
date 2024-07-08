import { graphql } from "react-relay";
import { Environment } from "relay-runtime";

import { CoralContext } from "coral-framework/lib/bootstrap";
import {
  commitMutationPromiseNormalized,
  createMutation,
  MutationInput,
} from "coral-framework/lib/relay";
import { UpdateInPageNotificationSettingsEvent } from "coral-stream/events";

import { UpdateInPageNotificationSettingsMutation as MutationTypes } from "coral-stream/__generated__/UpdateInPageNotificationSettingsMutation.graphql";

let clientMutationId = 0;

const UpdateInPageNotificationSettingsMutation = createMutation(
  "updateInPageNotificationSettings",
  async (
    environment: Environment,
    input: MutationInput<MutationTypes>,
    { eventEmitter }: CoralContext
  ) => {
    const updateInPageNotificationSettings =
      UpdateInPageNotificationSettingsEvent.begin(eventEmitter, {
        onFeatured: input.onFeatured,
        onModeration: input.onModeration,
      });
    try {
      const result = await commitMutationPromiseNormalized<MutationTypes>(
        environment,
        {
          mutation: graphql`
            mutation UpdateInPageNotificationSettingsMutation(
              $input: UpdateInPageNotificationSettingsInput!
            ) {
              updateInPageNotificationSettings(input: $input) {
                user {
                  id
                  inPageNotifications {
                    onReply {
                      enabled
                      showReplies
                    }
                    onFeatured
                    onModeration
                    enabled
                  }
                }
                clientMutationId
              }
            }
          `,
          variables: {
            input: {
              onReply: input.onReply,
              onFeatured: input.onFeatured,
              onModeration: input.onModeration,
              enabled: input.enabled,
              clientMutationId: (clientMutationId++).toString(),
            },
          },
        }
      );
      updateInPageNotificationSettings.success();
      return result;
    } catch (error) {
      updateInPageNotificationSettings.error({
        message: error.message,
        code: error.code,
      });
      throw error;
    }
  }
);

export default UpdateInPageNotificationSettingsMutation;
