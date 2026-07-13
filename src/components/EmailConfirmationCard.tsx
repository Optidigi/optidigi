import { BorderBeam } from "@/components/ui/border-beam"

function GmailIcon() {
  return (
    <svg
      className="relative z-10 size-3.5"
      viewBox="0 49.4 512 399.42"
      aria-hidden="true"
    >
      <g fill="none" fillRule="evenodd">
        <g fillRule="nonzero">
          <path
            fill="#4285f4"
            d="M34.91 448.818h81.454V251L0 163.727V413.91c0 19.287 15.622 34.91 34.91 34.91z"
          />
          <path
            fill="#34a853"
            d="M395.636 448.818h81.455c19.287 0 34.909-15.622 34.909-34.909V163.727L395.636 251z"
          />
          <path
            fill="#fbbc04"
            d="M395.636 99.727V251L512 163.727v-46.545c0-43.142-49.25-67.782-83.782-41.891z"
          />
        </g>
        <path
          fill="#ea4335"
          d="M116.364 251V99.727L256 204.455 395.636 99.727V251L256 355.727z"
        />
        <path
          fill="#c5221f"
          fillRule="nonzero"
          d="M0 117.182v46.545L116.364 251V99.727L83.782 75.291C49.25 49.4 0 74.04 0 117.18z"
        />
      </g>
    </svg>
  )
}

export function EmailConfirmationCard() {
  return (
    <div className="bg-card ring-border-illustration relative flex items-center gap-2 overflow-hidden rounded-xl p-3 shadow ring-1">
      <BorderBeam
        size={38}
        borderRadius={12}
        duration={7}
        className="blur-[2px] bg-[linear-gradient(to_left,var(--color-from)_0%,var(--color-to)_38%,transparent_98%)]"
      />
      <GmailIcon />
      <span className="text-muted-foreground relative z-10 text-xs font-medium">
        Bevestiging sturen{" "}
        <span className="text-foreground/50 pl-0.5 text-xs">nu</span>
      </span>
    </div>
  )
}

export default EmailConfirmationCard
