from pptx import Presentation
from pptx.util import Inches

def create_slides(title, content_list):
    prs = Presentation()

    # Add title slide
    title_slide = prs.slides.add_slide(prs.slide_layouts[0])
    title_slide.shapes.title.text = title

    # Add content slides
    for slide_data in content_list:
        slide = prs.slides.add_slide(prs.slide_layouts[1])
        slide.shapes.title.text = slide_data["title"]
        body = slide.placeholders[1]
        body.text = "\n".join(slide_data["points"])

    file_path = "output.pptx"
    prs.save(file_path)
    return file_path