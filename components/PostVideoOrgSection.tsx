import OrgChart3DSplitPreview from "@/components/OrgChart3DSplitPreview";
import PictureArcStacks from "@/components/PictureArcStacks";

export default function PostVideoOrgSection() {
  return (
    <section className="post-video-org-section" dir="rtl" aria-label="מבנה הרבנות הצבאית">
      <div className="post-video-org-backdrop" aria-hidden="true" />
      <PictureArcStacks />
      <div className="post-video-org-content">
        <OrgChart3DSplitPreview />
      </div>
    </section>
  );
}
