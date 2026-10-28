"use client";

import { useActionState, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { createAssetAction, updateAssetAction } from "@/actions/assets";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Field, FormError, Input, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/components/ui/toast";
import { firstFieldError } from "@/lib/validation/utils";
import { ASSET_TYPE_LABELS, EXPOSURE_LABELS } from "@/lib/constants";
import type { ActionState } from "@/types/actions";
import { ASSET_TYPES, EXPOSURES, type Asset } from "@/types";

const CRITICALITY_OPTIONS = [
  { value: 1, label: "1 — Low" },
  { value: 2, label: "2 — Minor" },
  { value: 3, label: "3 — Moderate" },
  { value: 4, label: "4 — High" },
  { value: 5, label: "5 — Mission critical" },
];

interface AssetDialogProps {
  asset?: Asset;
  autoOpen?: boolean;
}

export function AssetDialog({ asset, autoOpen = false }: AssetDialogProps) {
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
        variant={asset ? "secondary" : "primary"}
        size={asset ? "sm" : "md"}
        onClick={() => setOpen(true)}
        aria-label={asset ? "Edit asset" : "Add asset"}
      >
        {asset ? (
          <Pencil className="size-3.5" aria-hidden="true" />
        ) : (
          <Plus className="size-4" aria-hidden="true" />
        )}
        {asset ? "Edit asset" : "Add asset"}
      </Button>
      <Modal
        open={open}
        onClose={close}
        title={asset ? "Edit asset" : "Add an asset"}
        description={
          asset
            ? "Update inventory details. Risk recalculates automatically."
            : "Inventory context makes findings more actionable. Only add systems you are authorized to assess."
        }
      >
        {open ? <AssetForm asset={asset} onCancel={close} onSuccess={handleSuccess} /> : null}
      </Modal>
    </>
  );
}

function AssetForm({
  asset,
  onCancel,
  onSuccess,
}: {
  asset?: Asset;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const action = asset ? updateAssetAction : createAssetAction;
  const [state, formAction] = useActionState<ActionState | null, FormData>(action, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.ok) {
      toast(state.message ?? "Saved.", "success");
      onSuccess();
    }
    // onSuccess/toast identities are stable enough for this one-shot transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const errors = state?.fieldErrors;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {asset ? <input type="hidden" name="id" value={asset.id} /> : null}
      <FormError message={state?.ok ? undefined : state?.message} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Display name"
          htmlFor="asset-name"
          required
          error={firstFieldError(errors, "name")}
        >
          <Input
            id="asset-name"
            name="name"
            defaultValue={asset?.name}
            placeholder="Production API"
            maxLength={80}
            required
            aria-invalid={Boolean(firstFieldError(errors, "name"))}
          />
        </Field>
        <Field
          label="Hostname"
          htmlFor="asset-hostname"
          required
          error={firstFieldError(errors, "hostname")}
          hint="Must be unique in the inventory."
        >
          <Input
            id="asset-hostname"
            name="hostname"
            defaultValue={asset?.hostname}
            placeholder="prod-api-01"
            maxLength={253}
            required
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={Boolean(firstFieldError(errors, "hostname"))}
          />
        </Field>
        <Field
          label="IP address"
          htmlFor="asset-ip"
          error={firstFieldError(errors, "ipAddress")}
          hint="Optional. IPv4 or IPv6."
        >
          <Input
            id="asset-ip"
            name="ipAddress"
            defaultValue={asset?.ipAddress ?? ""}
            placeholder="10.20.4.15"
            maxLength={45}
            spellCheck={false}
            aria-invalid={Boolean(firstFieldError(errors, "ipAddress"))}
          />
        </Field>
        <Field
          label="Asset type"
          htmlFor="asset-type"
          required
          error={firstFieldError(errors, "type")}
        >
          <Select id="asset-type" name="type" defaultValue={asset?.type ?? "server"} required>
            {ASSET_TYPES.map((type) => (
              <option key={type} value={type}>
                {ASSET_TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Criticality"
          htmlFor="asset-criticality"
          required
          error={firstFieldError(errors, "criticality")}
        >
          <Select
            id="asset-criticality"
            name="criticality"
            defaultValue={String(asset?.criticality ?? 3)}
            required
          >
            {CRITICALITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Exposure"
          htmlFor="asset-exposure"
          required
          error={firstFieldError(errors, "exposure")}
        >
          <Select
            id="asset-exposure"
            name="exposure"
            defaultValue={asset?.exposure ?? "internal"}
            required
          >
            {EXPOSURES.map((exposure) => (
              <option key={exposure} value={exposure}>
                {EXPOSURE_LABELS[exposure]}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Owner"
          htmlFor="asset-owner"
          required
          error={firstFieldError(errors, "owner")}
        >
          <Input
            id="asset-owner"
            name="owner"
            defaultValue={asset?.owner}
            placeholder="Platform team"
            maxLength={80}
            required
            aria-invalid={Boolean(firstFieldError(errors, "owner"))}
          />
        </Field>
        <Field
          label="Operating system"
          htmlFor="asset-os"
          required
          error={firstFieldError(errors, "os")}
        >
          <Input
            id="asset-os"
            name="os"
            defaultValue={asset?.os}
            placeholder="Ubuntu 24.04 LTS"
            maxLength={80}
            required
            aria-invalid={Boolean(firstFieldError(errors, "os"))}
          />
        </Field>
      </div>

      <Field
        label="Tags"
        htmlFor="asset-tags"
        error={firstFieldError(errors, "tags")}
        hint="Comma-separated, up to 8 tags. Example: production, pci"
      >
        <Textarea
          id="asset-tags"
          name="tags"
          defaultValue={asset?.tags.join(", ")}
          placeholder="production, pci"
          maxLength={300}
          className="min-h-16"
        />
      </Field>

      <div className="flex justify-end gap-2 border-t border-white/8 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <SubmitButton label={asset ? "Save changes" : "Add asset"} />
      </div>
    </form>
  );
}
