import { PolarisRunConfig, PolarisRunResult } from "@polaris/core";
import {
  IGuidelineSource,
  IScrapeMetaData,
  IVisawiseInput,
} from "@visawise/core";
import { Model } from "sequelize";
import { polaris, visawise } from "../lib/connections";
import { HttpStatus } from "../lib/enum";
import { AppError } from "../lib/error";
import { SseBroadcastEvent, sseManager } from "../lib/sse/sse-manager";
import { GuidelineResultModel } from "../models";
import { GuidelineConfigModel } from "../models/guideline-config.model";
import {
  NotificationModel,
  NotificationType,
} from "../models/notification.model";
import {
  ConfirmGuidelineRequest,
  CreateGuidelineAutomateRequest,
  DeleteGuidelineAutomateRequest,
  GuidelineAutomateStatus,
  GuidelineDetailRequest,
  IPagination,
  PlayGuidelineAutomateRequest,
  RunGuidelineAutomateRequest,
  SaveGuidelineAutomateRequest,
  UpdateAutomationStepRequest,
} from "../types";
import { getPaginatedData } from "./utils";

const setGuidelineRunning = async (
  guidelineId: string,
  isRunning: boolean,
): Promise<void> => {
  await GuidelineConfigModel.update(
    { is_running: isRunning },
    { where: { id: guidelineId } },
  );
};

export async function createGuidelineAutomate(
  req: CreateGuidelineAutomateRequest,
): Promise<GuidelineConfigModel> {
  const existing = await GuidelineConfigModel.findOne({
    where: {
      source_country_id: req.sourceCountryId,
      destination_country_id: req.destinationCountryId,
      visa_type_id: req.visaTypeId,
      sub_visa_type_id: req.subVisaTypeId,
    },
  });

  if (existing) {
    throw new AppError(
      `Guideline automation already exists for source_country: ${req.sourceCountry}, destination_country: ${req.destinationCountry}, visa_type: ${req.visaType}, subvisa_type: ${req.subvisaType ?? null}`,
      HttpStatus.CONFLICT,
    );
  }

  const record = await GuidelineConfigModel.create({
    source_country_id: req.sourceCountryId,
    source_country: req.sourceCountry,
    destination_country_id: req.destinationCountryId,
    destination_country: req.destinationCountry,
    visa_type_id: req.visaTypeId,
    visa_type: req.visaType,
    sub_visa_type_id: req.subVisaTypeId,
    subvisa_type: req.subvisaType ?? null,
    status: GuidelineAutomateStatus.IN_PROGRESS,
  });
  return record;
}

export async function playGuidelineAutomate(
  req: PlayGuidelineAutomateRequest,
): Promise<boolean> {
  try {
    sseManager.broadcast(SseBroadcastEvent.AUTOMATION_PLAY_STARTED, {
      guidelineId: req.guidelineId,
      tabId: req.tabId,
      clientId: req.clientId,
    });
    const automationConfig = {
      useSession: req.useSession,
      flows: req.flows,
      mode: "play",
    } as PolarisRunConfig;

    const playResult = await polaris.run(automationConfig);

    sseManager.broadcast(SseBroadcastEvent.AUTOMATION_PLAY_COMPLETED, {
      guidelineId: req.guidelineId,
      tabId: req.tabId,
      clientId: req.clientId,
      result: playResult,
    });

    return true;
  } catch (error) {
    sseManager.broadcast(SseBroadcastEvent.AUTOMATION_PLAY_ERROR, {
      guidelineId: req.guidelineId,
      tabId: req.tabId,
      clientId: req.clientId,
      result: error instanceof Error ? error.message : String(error),
    });
    throw new Error(
      `playGuidelineAutomate failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function saveGuidelineAutomate(
  req: SaveGuidelineAutomateRequest,
): Promise<GuidelineConfigModel> {
  try {
    const record = await GuidelineConfigModel.findOne({
      where: { id: req.guidelineId },
    });

    if (!record) {
      throw new AppError(
        `Guideline automation not found for id: ${req.guidelineId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    await record.update({
      automation_step: JSON.stringify(req.automationConfig),
      status: GuidelineAutomateStatus.PUBLISHED,
    });

    return record;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new Error(
      `saveGuidelineAutomate failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function listGuidelineAutomate(req: IPagination) {
  try {
    return getPaginatedData(
      GuidelineConfigModel as unknown as {
        new (): GuidelineConfigModel;
      } & typeof Model,
      {
        attributes: [
          "id",
          "readable_id",
          "source_country",
          "destination_country",
          "visa_type",
          "subvisa_type",
          "status",
          "is_running",
        ],
        where: { status: req.status },
        include: [
          {
            model: GuidelineResultModel,
            as: "guideline_result",
            attributes: ["id", "is_confirmed"],
            required: false,
          },
        ],
        order: [["created_at", "DESC"]],
        raw: true,
        nest: true,
      },
      req.limit,
      req.page,
    );
  } catch (error) {
    throw new Error(
      `listGuidelineAutomate failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function detailGuidelineAutomate(
  req: RunGuidelineAutomateRequest,
): Promise<GuidelineConfigModel> {
  try {
    const record = await GuidelineConfigModel.findOne({
      where: { id: req.guidelineId },
      attributes: [
        "id",
        "readable_id",
        "source_country",
        "destination_country",
        "visa_type",
        "subvisa_type",
        "status",
        "automation_step",
      ],
    });

    if (!record) {
      throw new AppError(
        `Guideline automation not found for id: ${req.guidelineId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (record.automation_step) {
      record.automation_step = JSON.parse(record.automation_step);
    }

    return record;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new Error(
      `detailGuidelineAutomate failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function updateAutomationStep(
  req: UpdateAutomationStepRequest,
): Promise<GuidelineConfigModel> {
  try {
    const record = await GuidelineConfigModel.findOne({
      where: { id: req.guidelineId },
    });

    if (!record) {
      throw new AppError(
        `Guideline automation not found for id: ${req.guidelineId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    await record.update({
      automation_step: JSON.stringify(req.automationStep),
      status: GuidelineAutomateStatus.IN_PROGRESS,
    });

    return record;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new Error(
      `updateAutomationStep failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function confirmGuideline(
  req: ConfirmGuidelineRequest,
): Promise<GuidelineResultModel> {
  try {
    const record = await GuidelineResultModel.findOne({
      where: { guideline_config_id: req.guidelineId },
    });

    if (!record) {
      throw new AppError(
        `Guideline result not found for id: ${req.guidelineId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Update the record with the confirmed guideline and set is_confirmed to true
    // We also set generated_guideline to null since we now have a confirmed guideline
    await record.update({
      existing_guideline: JSON.stringify(req.guideline),
      generated_guideline: null,
      is_confirmed: true,
    });

    return record;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new Error(
      `confirmGuideline failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function deleteGuidelineAutomate(
  req: DeleteGuidelineAutomateRequest,
): Promise<void> {
  try {
    const record = await GuidelineConfigModel.findOne({
      where: { id: req.guidelineId },
    });

    if (!record) {
      throw new AppError(
        `Guideline automation not found for id: ${req.guidelineId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    await GuidelineResultModel.destroy({
      where: { guideline_config_id: req.guidelineId },
    });

    await record.destroy();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new Error(
      `deleteGuidelineAutomate failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}

const convertPolarisOutput = (
  polarisResult: PolarisRunResult,
  metaData: IScrapeMetaData,
  existingGuideline: Record<string, any>,
): IVisawiseInput => {
  const sources: IGuidelineSource[] = [];

  for (const flow of Object.values(polarisResult.flows)) {
    for (const step of flow.steps) {
      if (step.action === "extract") {
        sources.push({
          stepName: step.name,
          url: flow.url,
          content: (step as any).extractedContent ?? "",
        });
      } else if (step.action === "extractPDF") {
        sources.push({
          stepName: step.name,
          url: (step as any).pdfUrl ?? "",
          content: (step as any).extractedContent ?? "",
        });
      } else if (step.action === "extractScreenshot") {
        sources.push({
          stepName: step.name,
          url: flow.url,
          content: (step as any).extractedContent ?? "",
        });
      }
    }
  }

  return { metaData, sources, existingGuideline };
};

async function isValidGuideline(
  guidelineId: string,
): Promise<GuidelineConfigModel> {
  try {
    const guidelineConfigRecord = await GuidelineConfigModel.findOne({
      where: { id: guidelineId },
    });

    if (!guidelineConfigRecord) {
      throw new AppError(
        `Guideline automation not found for id: ${guidelineId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!guidelineConfigRecord.automation_step) {
      throw new AppError(
        `Guideline automation has no saved config — run /save first`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (guidelineConfigRecord.status !== GuidelineAutomateStatus.PUBLISHED) {
      throw new AppError(
        `Guideline automation cannot be run — status is ${guidelineConfigRecord.status}. Only PUBLISHED guidelines can be run.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (guidelineConfigRecord.is_running) {
      throw new AppError(
        `Guideline automation is already running.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return guidelineConfigRecord;
  } catch (error) {
    throw new AppError(
      `Guideline automation validation failed for id: ${guidelineId} — ${error instanceof Error ? error.message : error}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

async function existingGuideline(guidelineId: string): Promise<{
  isGuidelineResultRecordExist: boolean;
  existingGuideline: Record<string, any>;
}> {
  try {
    const guidelineResultRecord = await GuidelineResultModel.findOne({
      where: { guideline_config_id: guidelineId },
      raw: true,
    });

    const isGuidelineResultRecordExist = guidelineResultRecord ? true : false;

    const existingGuideline =
      isGuidelineResultRecordExist && guidelineResultRecord?.existing_guideline
        ? JSON.parse(guidelineResultRecord.existing_guideline)
        : {};
    return { isGuidelineResultRecordExist, existingGuideline };
  } catch (error) {
    throw new AppError(
      `Failed to fetch existing guideline for id: ${guidelineId} — ${error instanceof Error ? error.message : error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

function broadcastNotification({
  event,
  message,
}: {
  event: SseBroadcastEvent;
  message: Record<string, any>;
}) {
  sseManager.broadcast(event, message);
}

async function updateNewGuidelineResult({
  isGuidelineRecordExist,
  guidelineId,
  guidelineResult,
}: {
  isGuidelineRecordExist: boolean;
  guidelineId: string;
  guidelineResult: any;
}): Promise<void> {
  try {
    if (isGuidelineRecordExist) {
      await GuidelineResultModel.update(
        {
          scrape: JSON.stringify(guidelineResult.scrapeSources),
          analysis_result: JSON.stringify(guidelineResult.analysisResults),
          generated_guideline: JSON.stringify(guidelineResult.resultGuideline),
          is_confirmed: false,
          active_status: true,
        },
        { where: { guideline_config_id: guidelineId } },
      );
    } else {
      await GuidelineResultModel.create({
        guideline_config_id: guidelineId,
        scrape: JSON.stringify(guidelineResult.scrapeSources),
        analysis_result: JSON.stringify(guidelineResult.analysisResults),
        generated_guideline: JSON.stringify(guidelineResult.resultGuideline),
        is_confirmed: false,
        active_status: true,
      });
    }
  } catch (error) {
    throw new AppError(
      `Failed to update guideline result for id: ${guidelineId} — ${error instanceof Error ? error.message : error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

async function updateNotification(
  guidelineConfigRecord: GuidelineConfigModel,
): Promise<{ notificationRecord: NotificationModel; message: string }> {
  try {
    const confirmMessage = `Review required for ${guidelineConfigRecord.source_country} → ${guidelineConfigRecord.destination_country} (${guidelineConfigRecord.visa_type} / ${guidelineConfigRecord.subvisa_type ?? ""}).`;
    // check if there's an existing unread notification for the same guideline automation,
    // if yes update the message and created_at, if not create a new notification
    const existingUnreadNotification = await NotificationModel.findOne({
      where: {
        automation_id: guidelineConfigRecord.id,
        notification_type: NotificationType.CONFIRM_GUIDELINE,
        is_read: false,
      },
    });

    let notificationRecord: NotificationModel;
    if (existingUnreadNotification) {
      await existingUnreadNotification.update({
        message: confirmMessage,
        created_at: new Date(),
      });
      notificationRecord = existingUnreadNotification;
    } else {
      notificationRecord = await NotificationModel.create({
        automation_id: guidelineConfigRecord.id,
        notification_type: NotificationType.CONFIRM_GUIDELINE,
        message: confirmMessage,
      });
    }
    return { notificationRecord, message: confirmMessage };
  } catch (error) {
    throw new AppError(
      `Failed to update notification for guidelineId: ${guidelineConfigRecord.id} — ${error instanceof Error ? error.message : error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

async function runCoreFeature(
  guidelineConfigRecord: GuidelineConfigModel,
): Promise<any> {
  try {
    // Convert saved automation_step to PolarisRunConfig and run Polaris
    const automationConfig = {
      ...JSON.parse(guidelineConfigRecord.automation_step ?? "{}"),
      mode: "run",
    } as PolarisRunConfig;

    const polarisResult = await polaris.run(automationConfig);
    const automateInput = convertPolarisOutput(
      // Convert Polaris output to Visawise input format
      polarisResult,
      {
        country: guidelineConfigRecord.source_country,
        visaType: guidelineConfigRecord.visa_type,
        subVisaType: guidelineConfigRecord.subvisa_type ?? "",
      },
      existingGuideline,
    );
    const guidelineResult = await visawise.run(automateInput); // Run Visawise with the converted input
    return guidelineResult;
  } catch (packageError) {
    /**
     * HANDLING AUTOMATION RUN ERROR - SEPARATELY
     * Run error can come from either Polarise or Visawise
     * POLARISE: Run can fail due to XPath changes - MORE CHANCE OF OCCURRENCE
     * VISAWISE: Run can fail due to token limit exceed - LESS CHANCE OF OCCURRENCE
     * In both cases, we want to update the automation status to RUN_ERROR and notify the user with the error message
     */
    await GuidelineConfigModel.update(
      { status: GuidelineAutomateStatus.RUN_ERROR },
      { where: { id: guidelineConfigRecord.id } },
    );

    // workflow list specific broadcating
    broadcastNotification({
      event: SseBroadcastEvent.AUTOMATION_RUN_ERROR,
      message: {
        guidelineId: guidelineConfigRecord.id,
      },
    });

    const errorMessage = `Automation run failed for ${guidelineConfigRecord.source_country} → ${guidelineConfigRecord.destination_country} (${guidelineConfigRecord.visa_type} / ${guidelineConfigRecord.subvisa_type ?? ""}).`;

    const notificationRecord = await NotificationModel.create({
      automation_id: guidelineConfigRecord.id,
      notification_type: NotificationType.RUN_ERROR,
      message: errorMessage,
    });

    // global broadcasing for notification
    broadcastNotification({
      event: SseBroadcastEvent.GUIDELINE_NOTIFICATION,
      message: {
        id: notificationRecord.id,
        notification_type: NotificationType.RUN_ERROR,
        automation_id: guidelineConfigRecord.id,
        message: errorMessage,
      },
    });

    throw new AppError(
      `Automation package run failed:  ${packageError instanceof Error ? packageError.message : packageError}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export async function runAutomation(
  req: RunGuidelineAutomateRequest,
): Promise<any> {
  try {
    const guidelineConfigRecord = await isValidGuideline(req.guidelineId);
    const existingGuidelineRecord = await existingGuideline(req.guidelineId);
    await setGuidelineRunning(req.guidelineId, true);

    broadcastNotification({
      event: SseBroadcastEvent.MANUAL_AUTOMATION_RUN_STARTED,
      message: {
        guidelineId: req.guidelineId,
      },
    });

    // run polarise & visawise feature
    const guidelineResult = await runCoreFeature(guidelineConfigRecord);

    await updateNewGuidelineResult({
      isGuidelineRecordExist:
        existingGuidelineRecord.isGuidelineResultRecordExist,
      guidelineId: req.guidelineId,
      guidelineResult: guidelineResult,
    });

    const { notificationRecord, message: confirmMessage } =
      await updateNotification(guidelineConfigRecord);

    await setGuidelineRunning(req.guidelineId, false);
    // sending response to FE via notification channel through SSE
    broadcastNotification({
      event: SseBroadcastEvent.MANUAL_AUTOMATION_RUN_COMPLETED,
      message: {
        guidelineId: req.guidelineId,
        tabId: req.tabId,
        clientId: req.clientId,
        result: {
          generated_guideline: guidelineResult.resultGuideline,
          existing_guideline: existingGuidelineRecord.existingGuideline,
          mode: guidelineResult.mode,
        },
      },
    });

    // global broadcasing for notification
    broadcastNotification({
      event: SseBroadcastEvent.GUIDELINE_NOTIFICATION,
      message: {
        id: notificationRecord.id,
        notification_type: NotificationType.CONFIRM_GUIDELINE,
        automation_id: req.guidelineId,
        message: confirmMessage,
      },
    });

    return true;
  } catch (error) {
    try {
      await setGuidelineRunning(req.guidelineId, false);
    } catch {
      console.log(
        `Failed to reset is_running for guidelineId: ${req.guidelineId}`,
      );
    }
    // sending error response to FE via notification channel through SSE
    broadcastNotification({
      event: SseBroadcastEvent.MANUAL_AUTOMATION_RUN_ERROR,
      message: {
        guidelineId: req.guidelineId,
        tabId: req.tabId,
        clientId: req.clientId,
        result: error instanceof Error ? error.message : error,
      },
    });

    throw new Error(
      `runGuidelineAutomate failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function cronRunAutomation(guidelineId: string): Promise<boolean> {
  try {
    const guidelineConfigRecord = await isValidGuideline(guidelineId);
    const existingGuidelineRecord = await existingGuideline(guidelineId);
    await setGuidelineRunning(guidelineId, true);
    // workflow list specific broadcating
    broadcastNotification({
      event: SseBroadcastEvent.AUTOMATION_STARTED,
      message: {
        guidelineId: guidelineId,
      },
    });

    // run polarise & visawise feature
    const guidelineResult = await runCoreFeature(guidelineConfigRecord);

    await updateNewGuidelineResult({
      isGuidelineRecordExist:
        existingGuidelineRecord.isGuidelineResultRecordExist,
      guidelineId: guidelineId,
      guidelineResult: guidelineResult,
    });

    const { notificationRecord, message: confirmMessage } =
      await updateNotification(guidelineConfigRecord);

    await setGuidelineRunning(guidelineId, false);

    // workflow list specific broadcating
    broadcastNotification({
      event: SseBroadcastEvent.AUTOMATION_COMPLETED,
      message: {
        guidelineId: guidelineId,
      },
    });

    // global broadcasing for notification
    broadcastNotification({
      event: SseBroadcastEvent.GUIDELINE_NOTIFICATION,
      message: {
        id: notificationRecord.id,
        notification_type: NotificationType.CONFIRM_GUIDELINE,
        automation_id: guidelineId,
        message: confirmMessage,
      },
    });
    return true;
  } catch (error) {
    try {
      await setGuidelineRunning(guidelineId, false);
    } catch {
      console.log(`Failed to reset is_running for guidelineId: ${guidelineId}`);
    }
    return false;
  }
}

export async function getGuidelineDetail(req: GuidelineDetailRequest): Promise<{
  existing_guideline: object | null;
  generated_guideline: object | null;
  is_confirmed: boolean | null;
  mode: "review" | "generate";
}> {
  try {
    const record = await GuidelineResultModel.findOne({
      where: { guideline_config_id: req.guidelineId },
      attributes: ["existing_guideline", "generated_guideline", "is_confirmed"],
    });

    if (!record) {
      throw new AppError(
        `Guideline result not found for id: ${req.guidelineId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    const existingGuideline = record.existing_guideline
      ? JSON.parse(record.existing_guideline)
      : null;

    const resultGuideline = record.generated_guideline
      ? JSON.parse(record.generated_guideline)
      : null;

    return {
      existing_guideline: existingGuideline,
      generated_guideline: resultGuideline,
      is_confirmed: record.is_confirmed ?? null,
      mode: existingGuideline && resultGuideline ? "review" : "generate",
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new Error(
      `getGuidelineDetail failed: ${error instanceof Error ? error.message : error}`,
    );
  }
}
