import io
from pypdf import PdfReader, PdfWriter
from PIL import Image

def optimize_pdf(file_bytes: bytes) -> bytes:
    """
    Otimiza um arquivo PDF removendo objetos não utilizados, fluxos duplicados
    e comprimindo fluxos de conteúdo.
    """
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        writer = PdfWriter()

        # 1. Verificação de Segurança: Criptografia
        if reader.is_encrypted:
            print("PDF está criptografado. Pulando otimização.")
            return file_bytes

        # 2. Verificação de Segurança: Assinaturas Digitais (Heurística básica)
        # O acesso a /AcroForm /Fields pode indicar a presença de assinaturas ou formulários
        if "/AcroForm" in reader.trailer["/Root"]:
            # Se possui formulários, modificar o arquivo pode quebrar assinaturas.
            print("PDF possui AcroForms/Assinaturas. Pulando otimização por segurança.")
            return file_bytes

        for page in reader.pages:
            writer.add_page(page)

        # Comprime fluxos de conteúdo em todas as páginas do writer
        for page in writer.pages:
            page.compress_content_streams()

        # 3. Otimização Estrutural
        writer.compress_identical_objects(remove_identicals=True, remove_orphans=True)

        output_stream = io.BytesIO()
        writer.write(output_stream)
        output_stream.seek(0)
        
        optimized_bytes = output_stream.getvalue()
        
        # Retorna apenas se houve ganho de espaço
        if len(optimized_bytes) < len(file_bytes):
            return optimized_bytes
        
        return file_bytes

    except Exception as e:
        print(f"Falha na otimização do PDF: {e}")
        return file_bytes

def optimize_image(file_bytes: bytes, max_width: int = 2048, quality: int = 80) -> tuple[bytes, str]:
    """
    Otimiza uma imagem (JPG/PNG) redimensionando e comprimindo.
    Retorna (bytes_otimizados, mime_type).
    Sempre converte para JPEG, a menos que possua transparência.
    """
    try:
        img = Image.open(io.BytesIO(file_bytes))
        
        # 1. Redimensionar se for muito grande
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
        # 2. Converter para RGB (se for RGBA, decide se mantém PNG ou converte)
        output_stream = io.BytesIO()
        mime_type = "image/jpeg"
        
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            # Mantém PNG se houver transparência
            mime_type = "image/png"
            # Nível de compressão PNG (0-9)
            img.save(output_stream, format='PNG', optimize=True)
        else:
            # Converte para JPG para maior compressão
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img.save(output_stream, format='JPEG', quality=quality, optimize=True)
            
        output_stream.seek(0)
        optimized_bytes = output_stream.getvalue()
        
        # Retorna otimizado apenas se for menor que o original
        if len(optimized_bytes) < len(file_bytes):
            return optimized_bytes, mime_type
            
        return file_bytes, mime_type

    except Exception as e:
        print(f"Falha na otimização da imagem: {e}")
        return file_bytes, "image/jpeg"
