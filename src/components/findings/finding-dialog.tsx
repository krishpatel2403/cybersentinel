"use client";

import { useActionState, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { createFindingAction, updateFindingAction } from "@/actions/findings";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Field, FormError, Input, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toast";
import { firstFieldError } from "@/lib/validation/utils";
import { SEVERITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import type { ActionState } from "@/types/actions";
import {
  FINDING_STATUSES,
  SEVERITIES,
  type Asset,
  type FindingWithAsset,
  type Role,
} from "@/types";

interface FindingDialogProps {
  assets: Asset[];
  finding?: FindingWithAsset;
  role: Role;
  autoOpen?: boolean;
  defaultAssetId?: string;
}

export function FindingDialog({
  assets,
  finding,
  role,
  autoOpen = false,
  defaultAssetId,
}: FindingDialogProps) {
  const [open, setOpen] = useState(autoOpen);
  const router = useRouter();
  const pathname = usePathname();

  function close() {
    setOpen(false);
    if (autoOpen) router.replace(pathname, { scroll: false });
  }

  function handleSuccess() {
    setOpen(false);
    router.refresh();
    if (autoOpen) router.replace(pathname, { scroll: false });
  }

  return (
    <>
      <Button
        type="button"
        variant={finding ? "secondary" : "primary"}
        size={finding ? "sm" : "md"}
        onClick={() => setOpen(true)}
        disabled={assets.length === 0}
        title={assets.length === 0 ? "Add an asset before recording findings" : undefined}
      >
        {finding ? (
          <Pencil className="size-3.5" aria-hidden="true" />
        ) : (
          <Plus className="size-4" aria-hidden="true" />
        )}
        {finding ? "Edit finding" : "New finding"}
      </Button>
      <Modal
        open={open}
        onClose={close}
        title={finding ? "Edit finding" : "Record a finding"}
        description="Findings drive the posture score. Use accurate severity and exposure data; do not include credentials or personal data."
        className="w-[min(94vw,50rem)]"
      >
        {open ? (
          <FindingForm
            assets={assets}
            finding={finding}
            role={role}
            defaultAssetId={defaultAssetId}
            onCancel={close}
            onSuccess={handleSuccess}
          />
        ) : null}
      </Modal>
    </>
  );
}

function FindingForm({
  assets,
  finding,
  role,
  defaultAssetId,
  onCancel,
  onSuccess,
}: {
  assets: Asset[];
  finding?: FindingWithAsset;
  role: Role;
  defaultAssetId?: string;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const action = finding ? updateFindingAction : createFindingAction;
  const [state, formAction] = useActionState<ActionState | null, FormData>(action, null);
  const { toast } = useToast();
  const errors = state?.fieldErrors;
  const canAcceptRisk = role === "admin";

  useEffect(() => {
    if (state?.ok) {
      toast(state.message ?? "Finding saved.", "success");
      onSuccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {finding ? <input type="hidden" name="id" value={finding.id} /> : null}
      <FormError message={state?.ok ? undefined : state?.message} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Affected asset"
          htmlFor="finding-asset"
          required
          error={firstFieldError(errors, "assetId")}
        >
          <Select
            id="finding-asset"
            name="assetId"
            defaultValue={finding?.assetId ?? defaultAssetId ?? assets[0]?.id}
            required
          >
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name} ({asset.hostname})
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Title"
          htmlFor="finding-title"
          required
          error={firstFieldError(errors, "title")}
        >
          <Input
            id="finding-title"
            name="title"
            defaultValue={finding?.title}
            placeholder="Outdated TLS configuration"
            maxLength={140}
            required
            aria-invalid={Boolean(firstFieldError(errors, "title"))}
          />
        </Field>
        <Field
          label="Severity"
          htmlFor="finding-severity"
          required
          error={firstFieldError(errors, "severity")}
        >
          <Select
            id="finding-severity"
            name="severity"
            defaultValue={finding?.severity ?? "medium"}
            required
          >
            {SEVERITIES.map((severity) => (
              <option key={severity} value={severity}>
                {SEVERITY_LABELS[severity]}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Status"
          htmlFor="finding-status"
          required
          error={firstFieldError(errors, "status")}
        >
          <Select
            id="finding-status"
            name="status"
            defaultValue={finding?.status ?? "open"}
            required
          >
            {FINDING_STATUSES.filter(
              (status) =>
                status !== "accepted_risk" || canAcceptRisk || finding?.status === "accepted_risk",
            ).map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="CVSS score"
          htmlFor="finding-cvss"
          error={firstFieldError(errors, "cvss")}
          hint="Optional, 0.0–10.0."
        >
          <Input
            id="finding-cvss"
            name="cvss"
            type="number"
            step="0.1"
            min="0"
            max="10"
            defaultValue={finding?.cvss ?? ""}
            placeholder="7.5"
          />
        </Field>
        <Field
          label="CVE identifier"
          htmlFor="finding-cve"
          error={firstFieldError(errors, "cveId")}
          hint="Optional. Format: CVE-YYYY-NNNN."
        >
          <Input
            id="finding-cve"
            name="cveId"
            defaultValue={finding?.cveId ?? ""}
            placeholder="CVE-2024-3400"
            maxLength={32}
            spellCheck={false}
            autoCapitalize="characters"
          />
        </Field>
        <Field
          label="Due date"
          htmlFor="finding-due"
          error={firstFieldError(errors, "dueDate")}
          hint="Optional remediation deadline."
        >
          <Input
            id="finding-due"
            name="dueDate"
            type="date"
            defaultValue={finding?.dueDate ?? ""}
            className="[color-scheme:dark]"
          />
        </Field>
      </div>

      <Field
        label="Description"
        htmlFor="finding-description"
        required
        error={firstFieldError(errors, "description")}
      >
        <Textarea
          id="finding-description"
          name="description"
          defaultValue={finding?.description}
          placeholder="What is affected, how it was found, and what evidence supports it?"
          maxLength={4000}
          required
          aria-invalid={Boolean(firstFieldError(errors, "description"))}
        />
      </Field>

      <Field
        label="Remediation notes"
        htmlFor="finding-remediation"
        error={firstFieldError(errors, "remediation")}
        hint="Optional owner notes. The local analyst can generate a plan if this is empty."
      >
        <Textarea
          id="finding-remediation"
          name="remediation"
          defaultValue={finding?.remediation}
          placeholder="Upgrade to the patched release, then validate the affected endpoint."
          maxLength={4000}
          className="min-h-20"
        />
      </Field>

      <div className="flex justify-end gap-2 border-t border-white/8 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <SubmitButton label={finding ? "Save changes" : "Record finding"} />
      </div>
    </form>
  );
}
