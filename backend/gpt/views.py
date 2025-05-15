from openai import OpenAI
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

class GPTSummaryView(APIView):
    def post(self, request):
        prompt = request.data.get("prompt")
        if not prompt:
            return Response({"error": "No prompt provided"}, status=400)

        chat_completion = client.chat.completions.create(
            model="gpt-3.5-turbo",  # 모델 나중에 변경 필요
            messages=[{"role": "user", "content": prompt}],
        )
        summary = chat_completion.choices[0].message.content.strip()
        return Response({"text": summary})