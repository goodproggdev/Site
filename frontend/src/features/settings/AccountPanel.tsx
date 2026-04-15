import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Label, TextInput } from "flowbite-react";
import axios from "axios";
import { changePassword, getUserDetails, patchUserDetails } from "../../api/cvApi";
import { isValidPassword } from "../../utils/password";
import { authErrorMessageFromAxios, formatAndLocalizeDrfErrors } from "../../utils/apiErrorI18n";

export default function AccountPanel() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileMsg, setProfileMsg] = useState<"idle" | "ok" | "err">("idle");
  const [profileErr, setProfileErr] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword1, setNewPassword1] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [pwdMsg, setPwdMsg] = useState<"idle" | "ok" | "err">("idle");
  const [pwdErr, setPwdErr] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await getUserDetails();
        if (cancelled) return;
        setEmail(u.email || "");
        setFirstName(u.first_name || "");
        setLastName(u.last_name || "");
      } catch {
        if (!cancelled) setProfileErr(t("settings.account.loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg("idle");
    setProfileErr("");
    setSavingProfile(true);
    try {
      await patchUserDetails({ first_name: firstName.trim(), last_name: lastName.trim() });
      setProfileMsg("ok");
    } catch (err) {
      setProfileMsg("err");
      if (axios.isAxiosError(err) && err.response?.data) {
        setProfileErr(formatAndLocalizeDrfErrors(err.response.data, t));
      } else {
        setProfileErr(t("settings.account.saveError"));
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg("idle");
    setPwdErr("");
    if (newPassword1 !== newPassword2) {
      setPwdErr(t("auth.signup.passwordMismatch"));
      setPwdMsg("err");
      return;
    }
    if (!isValidPassword(newPassword1)) {
      setPwdErr(t("auth.signup.passwordRules"));
      setPwdMsg("err");
      return;
    }
    setSavingPwd(true);
    try {
      await changePassword({
        old_password: oldPassword,
        new_password1: newPassword1,
        new_password2: newPassword2,
      });
      setPwdMsg("ok");
      setOldPassword("");
      setNewPassword1("");
      setNewPassword2("");
    } catch (err) {
      setPwdMsg("err");
      if (axios.isAxiosError(err)) {
        setPwdErr(authErrorMessageFromAxios(err, t));
      } else {
        setPwdErr(t("settings.account.passwordError"));
      }
    } finally {
      setSavingPwd(false);
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400" role="status">
        {t("common.loading")}
      </p>
    );
  }

  return (
    <div className="space-y-10">
      <form onSubmit={(e) => void saveProfile(e)} className="space-y-4 max-w-lg">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t("settings.account.profileTitle")}</h3>
        <div>
          <Label htmlFor="acc-email" value={t("settings.account.email")} />
          <TextInput id="acc-email" type="email" value={email} readOnly disabled className="mt-1 opacity-80" />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("settings.account.emailHint")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="acc-fn" value={t("settings.account.firstName")} />
            <TextInput
              id="acc-fn"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="acc-ln" value={t("settings.account.lastName")} />
            <TextInput
              id="acc-ln"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        {profileMsg === "ok" ? (
          <p className="text-sm text-green-700 dark:text-green-400" role="status">
            {t("settings.account.profileSaved")}
          </p>
        ) : null}
        {profileMsg === "err" && profileErr ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {profileErr}
          </p>
        ) : null}
        <Button type="submit" color="indigo" disabled={savingProfile}>
          {savingProfile ? t("common.loading") : t("settings.account.saveProfile")}
        </Button>
      </form>

      <form onSubmit={(e) => void savePassword(e)} className="space-y-4 max-w-lg border-t border-gray-200 dark:border-gray-700 pt-10">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t("settings.account.passwordTitle")}</h3>
        <div>
          <Label htmlFor="acc-old-pw" value={t("settings.account.currentPassword")} />
          <TextInput
            id="acc-old-pw"
            type="password"
            autoComplete="current-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="acc-np1" value={t("settings.account.newPassword")} />
          <TextInput
            id="acc-np1"
            type="password"
            autoComplete="new-password"
            value={newPassword1}
            onChange={(e) => setNewPassword1(e.target.value)}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="acc-np2" value={t("settings.account.confirmPassword")} />
          <TextInput
            id="acc-np2"
            type="password"
            autoComplete="new-password"
            value={newPassword2}
            onChange={(e) => setNewPassword2(e.target.value)}
            className="mt-1"
            required
          />
        </div>
        {pwdMsg === "ok" ? (
          <p className="text-sm text-green-700 dark:text-green-400" role="status">
            {t("settings.account.passwordChanged")}
          </p>
        ) : null}
        {pwdMsg === "err" && pwdErr ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {pwdErr}
          </p>
        ) : null}
        <Button type="submit" color="indigo" disabled={savingPwd}>
          {savingPwd ? t("common.loading") : t("settings.account.changePassword")}
        </Button>
      </form>
    </div>
  );
}
