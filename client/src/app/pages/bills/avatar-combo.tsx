import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BillType } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

import FormDialog from "./form-dialog";
import DeleteDialog from "@/components/component/delete-dialog";

import { numberFormatter } from "@/lib/utils";

const AvatarCombo = ({
  fallback,
  title,
  description,
  bill,
}: {
  fallback: React.ReactNode | string;
  title: string;
  description?: string | JSX.Element;
  bill: BillType;
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    // request server to delete
    console.log(bill.id);
    // if success close
    setOpen(false);
    // else toast
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <div className="items-center hidden lg:flex">
        <Avatar className="h-9 w-9">
          <AvatarImage alt="Avatar" />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <div className="ltr:ml-4 rtl:mr-4 space-y-1">
          <p className="text-sm font-medium leading-none" aria-label="Day">
            {title}
          </p>
          <p className="text-sm text-muted-foreground" aria-label="Date">
            {description}
          </p>
        </div>
      </div>
      <AlertDialogTrigger asChild className="lg:hidden">
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage alt="Avatar" />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <div className="ltr:ml-4 rtl:mr-4 space-y-1">
            <p className="text-sm font-medium leading-none" aria-label="Day">
              {title}
            </p>
            <p className="text-sm text-muted-foreground" aria-label="Date">
              {description}
            </p>
          </div>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="space-x-3 rtl:space-x-reverse">
            <span>{title}</span>
            <span>-</span>
            <span>{description}</span>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-2 text-left rtl:text-right">
              <div className="flex space-x-5 rtl:space-x-reverse text-foreground">
                <p>{t("Value")}:</p>
                <p>{numberFormatter(bill.value)}</p>
              </div>
              <div className="flex space-x-5 rtl:space-x-reverse text-foreground">
                <p>{t("Description")}:</p>
                <p>{bill.description}</p>
              </div>
              <div className="flex space-x-5 rtl:space-x-reverse text-foreground">
                <p>{t("Remarks")}:</p>
                <p>{bill.remarks}</p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
          <div className="flex flex-col gap-3 md:flex-row">
            <FormDialog
              bill={bill}
              onClose={(status) => {
                if (status == false) setOpen(false);
              }}
            >
              <Button>
                <Pencil2Icon className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                <span>{t("Edit")}</span>
              </Button>
            </FormDialog>
            <DeleteDialog onAction={handleDelete}>
              <Button variant={"secondary"}>
                <TrashIcon className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                <span>{t("Delete")}</span>
              </Button>
            </DeleteDialog>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AvatarCombo;
