from django.urls import path
from .views import GPTSummaryView

urlpatterns = [
    path("gpt", GPTSummaryView.as_view()),
]