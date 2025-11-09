"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Chip,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { Id } from "@repo/backend/convex/_generated/dataModel";

export default function SelectForm({ teamId }: { teamId: string }) {
  const router = useRouter();

  const metaForms = useQuery(api.core.onboarding.getAllMetaForms, { teamId });

  const updatePrimaryForms = useMutation(
    api.core.onboarding.updatePrimaryForms
  );
  const updateOnboardingStep = useMutation(
    api.core.onboarding.updateOnboardingStep
  );

  const [isLoading, setIsLoading] = useState(false);
  const [selectedFormIds, setSelectedFormIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (metaForms) {
      const primaryFormIds = metaForms
        .filter((f) => f.isPrimary)
        .map((f) => f.id);
      setSelectedFormIds(new Set(primaryFormIds));
    }
  }, [metaForms]);

  const handleFormToggle = (formId: string) => {
    setSelectedFormIds((prev) => {
      const next = new Set(prev);
      if (next.has(formId)) {
        next.delete(formId);
      } else {
        next.add(formId);
      }
      return next;
    });
  };

  const handleContinue = async () => {
    setIsLoading(true);
    if (selectedFormIds.size === 0) return;
    const formIds = Array.from(selectedFormIds) as Id<"metaForms">[];
    await updatePrimaryForms({
      metaFormIds: formIds,
      teamId,
    });

    updateOnboardingStep({
      teamId,
    });

    router.push("/onboarding/invite-teams");
  };

  return (
    <div className="space-y-8 py-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Select lead forms
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose which Meta lead forms you want to sync for your workspace. You
          can select multiple forms.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metaForms?.map((metaForm) => {
          const isSelected = selectedFormIds.has(metaForm.id);
          return (
            <FormCard
              key={metaForm.id}
              metaForm={metaForm}
              isSelected={isSelected}
              handleFormToggle={handleFormToggle}
            />
          );
        })}
      </div>

      {metaForms && metaForms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No Meta forms found. Please connect your Meta account first.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Button
          color="primary"
          isDisabled={selectedFormIds.size === 0}
          isLoading={isLoading}
          onPress={handleContinue}
        >
          Continue ({selectedFormIds.size} selected)
        </Button>
      </div>
    </div>
  );
}

type MetaFormType = {
  id: string;
  name: string;
  pageId: string;
  isPrimary: boolean;
};

const FormCard = ({
  metaForm,
  isSelected,
  handleFormToggle,
}: {
  metaForm: MetaFormType;
  isSelected: boolean;
  handleFormToggle: (formId: string) => void;
}) => {
  return (
    <Card
      key={metaForm.id}
      isPressable
      isHoverable
      onPress={() => handleFormToggle(metaForm.id)}
      className={isSelected ? "border-primary" : ""}
    >
      <CardHeader className="flex justify-between items-start gap-3">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{metaForm.name}</h3>
            {isSelected && (
              <Chip size="sm" color="success" variant="flat">
                Primary
              </Chip>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Page ID: {metaForm.pageId}
          </p>
        </div>
        <Checkbox
          isSelected={isSelected}
          onValueChange={() => handleFormToggle(metaForm.id)}
          color="primary"
        />
      </CardHeader>
      <CardBody>
        <p className="text-sm text-muted-foreground">
          {isSelected
            ? "✓ Selected as primary form"
            : "Click to select this form"}
        </p>
      </CardBody>
    </Card>
  );
};
